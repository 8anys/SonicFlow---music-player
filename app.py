import os
from pathlib import Path

import psycopg2
from flask import Flask, jsonify, request
from flask_cors import CORS
from psycopg2.extras import RealDictCursor


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
CORS(app)


@app.get("/db-api/health")
def health():
    fetch_all("SELECT 1 AS ok")
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
