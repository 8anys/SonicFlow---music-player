import os
from pathlib import Path

import psycopg2
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from psycopg2.extras import RealDictCursor
from werkzeug.security import check_password_hash, generate_password_hash


BASE_DIR = Path(__file__).resolve().parent
DATABASE_DIR = BASE_DIR / "database"


def load_env_file():
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


load_env_file()


def get_db_config():
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    return {
        "host": os.getenv("PGHOST", "127.0.0.1"),
        "port": os.getenv("PGPORT", "5432"),
        "dbname": os.getenv("PGDATABASE", "sonicflow"),
        "user": os.getenv("PGUSER", "postgres"),
        "password": os.getenv("PGPASSWORD", ""),
    }


def get_connection():
    db_config = get_db_config()

    if isinstance(db_config, str):
        return psycopg2.connect(db_config)

    return psycopg2.connect(**db_config)


def run_sql_file(cursor, filename):
    sql = (DATABASE_DIR / filename).read_text(encoding="utf-8")
    cursor.execute(sql)


def initialize_database():
    with get_connection() as connection:
        with connection.cursor() as cursor:
            run_sql_file(cursor, "schema.sql")
            run_sql_file(cursor, "seed.sql")


def fetch_all(sql, params=None):
    with get_connection() as connection:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(sql, params or [])
            return cursor.fetchall()


def normalize_limit(value, default=50, maximum=100):
    try:
        limit = int(value)
    except (TypeError, ValueError):
        return default

    if limit <= 0:
        return default

    return min(limit, maximum)


def map_track(row):
    return {
        "id": row["id"],
        "title": row["title"],
        "artist_name": row["artist_name"],
        "album_name": row["album_name"],
        "genre": row["genre"],
        "duration": row["duration_seconds"],
        "audio_url": row["audio_url"],
        "cover_url": row["cover_url"],
        "source_name": row["source_name"] or "Postgres",
        "source_url": row["source_url"],
        "plays": row["plays_count"],
        "is_trending": row["is_trending"],
    }


app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "sonicflow-secret")
CORS(app, supports_credentials=True)


def get_current_user_id():
    return session.get("user_id")


def public_user(row):
    if not row:
        return None

    return {
        "id": row["id"],
        "email": row["email"],
        "display_name": row["display_name"],
        "avatar_url": row["avatar_url"],
        "auth_provider": row["auth_provider"],
    }


def fetch_one(sql, params=None):
    rows = fetch_all(sql, params)
    return rows[0] if rows else None


def require_json_fields(data, fields):
    missing = [field for field in fields if not str(data.get(field, "")).strip()]
    if missing:
        return f"Missing fields: {', '.join(missing)}"
    return None


@app.get("/db-api/health")
def health():
    fetch_all("SELECT 1 AS ok")
    return jsonify({"ok": True})


@app.get("/db-api/auth/me")
def auth_me():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"user": None}), 401

    user = fetch_one(
        """
        SELECT id, email, display_name, avatar_url, auth_provider
        FROM users
        WHERE id = %s
        """,
        [user_id],
    )

    if not user:
        session.clear()
        return jsonify({"user": None}), 401

    return jsonify({"user": public_user(user)})


@app.post("/db-api/auth/register")
def auth_register():
    data = request.get_json(silent=True) or {}
    error = require_json_fields(data, ["display_name", "email", "password"])
    if error:
        return jsonify({"error": error}), 400

    email = data["email"].strip().lower()
    display_name = data["display_name"].strip()
    password = data["password"]

    if len(password) < 6:
        return jsonify({"error": "Password must contain at least 6 characters"}), 400

    password_hash = generate_password_hash(password)

    try:
        with get_connection() as connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    """
                    INSERT INTO users (email, display_name, password_hash, auth_provider)
                    VALUES (%s, %s, %s, 'local')
                    RETURNING id, email, display_name, avatar_url, auth_provider
                    """,
                    [email, display_name, password_hash],
                )
                user = cursor.fetchone()
    except psycopg2.errors.UniqueViolation:
        return jsonify({"error": "User with this email already exists"}), 409

    session["user_id"] = user["id"]
    return jsonify({"user": public_user(user)}), 201


@app.post("/db-api/auth/login")
def auth_login():
    data = request.get_json(silent=True) or {}
    error = require_json_fields(data, ["email", "password"])
    if error:
        return jsonify({"error": error}), 400

    email = data["email"].strip().lower()
    password = data["password"]
    user = fetch_one(
        """
        SELECT id, email, display_name, avatar_url, auth_provider, password_hash
        FROM users
        WHERE email = %s
        """,
        [email],
    )

    if not user or not user["password_hash"] or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    session["user_id"] = user["id"]
    return jsonify({"user": public_user(user)})


@app.post("/db-api/auth/google")
def auth_google():
    google_client_id = os.getenv("VITE_GOOGLE_CLIENT_ID") or os.getenv("GOOGLE_CLIENT_ID")
    if not google_client_id:
        return jsonify({"error": "Google Client ID is not configured"}), 400

    data = request.get_json(silent=True) or {}
    credential = data.get("credential")
    if not credential:
        return jsonify({"error": "Google credential is required"}), 400

    try:
        payload = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            google_client_id,
        )
    except ValueError:
        return jsonify({"error": "Invalid Google credential"}), 401

    email = payload.get("email", "").lower()
    google_sub = payload.get("sub")
    display_name = payload.get("name") or email.split("@")[0]
    avatar_url = payload.get("picture")

    if not email or not google_sub:
        return jsonify({"error": "Google account data is incomplete"}), 400

    with get_connection() as connection:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                INSERT INTO users (email, display_name, google_sub, auth_provider, avatar_url)
                VALUES (%s, %s, %s, 'google', %s)
                ON CONFLICT (email) DO UPDATE SET
                  google_sub = COALESCE(users.google_sub, EXCLUDED.google_sub),
                  avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url)
                RETURNING id, email, display_name, avatar_url, auth_provider
                """,
                [email, display_name, google_sub, avatar_url],
            )
            user = cursor.fetchone()

    session["user_id"] = user["id"]
    return jsonify({"user": public_user(user)})


@app.post("/db-api/auth/logout")
def auth_logout():
    session.clear()
    return jsonify({"ok": True})


@app.get("/db-api/tracks")
def tracks():
    limit = normalize_limit(request.args.get("limit"))
    search = (request.args.get("q") or "").strip()
    genre = (request.args.get("genre") or "").strip()
    sort = request.args.get("sort")
    params = []
    where = []

    if search:
        params.append(f"%{search}%")
        where.append(
            f"""(
                tracks.title ILIKE %s
                OR artists.name ILIKE %s
                OR albums.title ILIKE %s
            )"""
        )
        params.extend([params[0], params[0]])

    if genre and genre != "all":
        where.append("genres.name = %s")
        params.append(genre)

    order_by = "tracks.created_at DESC" if sort == "newest" else "tracks.plays_count DESC"
    where_sql = f"WHERE {' AND '.join(where)}" if where else ""
    params.append(limit)

    rows = fetch_all(
        f"""
        SELECT
            tracks.id,
            tracks.title,
            tracks.duration_seconds,
            tracks.audio_url,
            COALESCE(tracks.cover_url, albums.cover_url) AS cover_url,
            tracks.source_name,
            tracks.source_url,
            tracks.plays_count,
            tracks.is_trending,
            albums.title AS album_name,
            genres.name AS genre,
            string_agg(artists.name, ', ' ORDER BY track_artists.artist_order) AS artist_name
        FROM tracks
        LEFT JOIN albums ON albums.id = tracks.album_id
        LEFT JOIN genres ON genres.id = tracks.genre_id
        JOIN track_artists ON track_artists.track_id = tracks.id
        JOIN artists ON artists.id = track_artists.artist_id
        {where_sql}
        GROUP BY tracks.id, albums.title, albums.cover_url, genres.name
        ORDER BY {order_by}
        LIMIT %s
        """,
        params,
    )

    return jsonify([map_track(row) for row in rows])


@app.get("/db-api/artists")
def artists():
    rows = fetch_all(
        """
        SELECT
            artists.id,
            artists.name,
            artists.bio,
            artists.image_url,
            artists.followers_count AS followers,
            COUNT(track_artists.track_id)::int AS track_count
        FROM artists
        LEFT JOIN track_artists ON track_artists.artist_id = artists.id
        GROUP BY artists.id
        ORDER BY artists.followers_count DESC
        LIMIT %s
        """,
        [normalize_limit(request.args.get("limit"))],
    )
    return jsonify(rows)


@app.get("/db-api/albums")
def albums():
    rows = fetch_all(
        """
        SELECT
            albums.id,
            albums.title,
            albums.release_year,
            albums.cover_url,
            artists.name AS artist_name,
            COUNT(tracks.id)::int AS track_count
        FROM albums
        JOIN artists ON artists.id = albums.primary_artist_id
        LEFT JOIN tracks ON tracks.album_id = albums.id
        GROUP BY albums.id, artists.name
        ORDER BY albums.created_at DESC
        LIMIT %s
        """,
        [normalize_limit(request.args.get("limit"))],
    )
    return jsonify(rows)


@app.get("/db-api/playlists")
def playlists():
    rows = fetch_all(
        """
        SELECT
            playlists.id,
            playlists.name,
            playlists.description,
            playlists.cover_url,
            users.display_name AS owner_name,
            COUNT(playlist_tracks.track_id)::int AS tracks_count
        FROM playlists
        LEFT JOIN users ON users.id = playlists.user_id
        LEFT JOIN playlist_tracks ON playlist_tracks.playlist_id = playlists.id
        GROUP BY playlists.id, users.display_name
        ORDER BY playlists.created_at DESC
        LIMIT %s
        """,
        [normalize_limit(request.args.get("limit"))],
    )
    return jsonify(rows)


if __name__ == "__main__":
    try:
        initialize_database()
        print("Database tables and seed data are ready.")
    except Exception as error:
        print("Database initialization failed.")
        print(error)
        raise

    app.run(host="127.0.0.1", port=int(os.getenv("FLASK_RUN_PORT", "5000")), debug=True)
