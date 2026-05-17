INSERT INTO users (email, display_name)
VALUES ('demo@sonicflow.local', 'Demo User')
ON CONFLICT (email) DO NOTHING;

INSERT INTO genres (name)
VALUES ('pop'), ('rock'), ('electronic'), ('hip-hop'), ('indie')
ON CONFLICT (name) DO NOTHING;

INSERT INTO artists (name, followers_count)
VALUES
  ('Sonic Pulse', 120000),
  ('Neon Harbor', 98000),
  ('Velvet Drive', 87000),
  ('Midnight Circuit', 76000),
  ('Luna Wave', 65000)
ON CONFLICT (name) DO UPDATE SET followers_count = EXCLUDED.followers_count;

INSERT INTO albums (title, primary_artist_id, release_year, cover_url)
SELECT 'City Lights', artists.id, 2026, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
FROM artists WHERE artists.name = 'Sonic Pulse'
ON CONFLICT (title, primary_artist_id, release_year) DO NOTHING;

INSERT INTO albums (title, primary_artist_id, release_year, cover_url)
SELECT 'Afterglow', artists.id, 2025, 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800'
FROM artists WHERE artists.name = 'Neon Harbor'
ON CONFLICT (title, primary_artist_id, release_year) DO NOTHING;

INSERT INTO albums (title, primary_artist_id, release_year, cover_url)
SELECT 'Static Dreams', artists.id, 2026, 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800'
FROM artists WHERE artists.name = 'Midnight Circuit'
ON CONFLICT (title, primary_artist_id, release_year) DO NOTHING;

WITH track_rows (title, artist_name, album_title, genre_name, duration_seconds, plays_count, is_trending) AS (
  VALUES
    ('Run the Night', 'Sonic Pulse', 'City Lights', 'pop', 214, 920000, TRUE),
    ('Electric Hearts', 'Neon Harbor', 'Afterglow', 'electronic', 198, 810000, TRUE),
    ('Velvet Road', 'Velvet Drive', NULL, 'rock', 241, 640000, TRUE),
    ('Signal Lost', 'Midnight Circuit', 'Static Dreams', 'electronic', 226, 590000, FALSE),
    ('Moonlit Frequency', 'Luna Wave', NULL, 'indie', 203, 470000, FALSE)
),
inserted_tracks AS (
  INSERT INTO tracks (title, album_id, genre_id, duration_seconds, cover_url, source_name, source_url, plays_count, is_trending)
  SELECT
    track_rows.title,
    albums.id,
    genres.id,
    track_rows.duration_seconds,
    albums.cover_url,
    'Postgres',
    NULL,
    track_rows.plays_count,
    track_rows.is_trending
  FROM track_rows
  JOIN genres ON genres.name = track_rows.genre_name
  LEFT JOIN albums ON albums.title = track_rows.album_title
  WHERE NOT EXISTS (
    SELECT 1 FROM tracks WHERE tracks.title = track_rows.title
  )
  RETURNING id, title
)
INSERT INTO track_artists (track_id, artist_id, artist_order)
SELECT tracks.id, artists.id, 1
FROM tracks
JOIN (
  VALUES
    ('Run the Night', 'Sonic Pulse'),
    ('Electric Hearts', 'Neon Harbor'),
    ('Velvet Road', 'Velvet Drive'),
    ('Signal Lost', 'Midnight Circuit'),
    ('Moonlit Frequency', 'Luna Wave')
) AS pairs(title, artist_name) ON pairs.title = tracks.title
JOIN artists ON artists.name = pairs.artist_name
ON CONFLICT (track_id, artist_id) DO NOTHING;

INSERT INTO playlists (user_id, name, description, is_public)
SELECT users.id, 'Popular from Database', 'Seeded normalized PostgreSQL playlist', TRUE
FROM users
WHERE users.email = 'demo@sonicflow.local'
  AND NOT EXISTS (
    SELECT 1 FROM playlists WHERE playlists.name = 'Popular from Database'
  )
ON CONFLICT DO NOTHING;

INSERT INTO playlist_tracks (playlist_id, track_id, position)
SELECT playlists.id, tracks.id, row_number() OVER (ORDER BY tracks.plays_count DESC)
FROM playlists
CROSS JOIN tracks
WHERE playlists.name = 'Popular from Database'
ON CONFLICT DO NOTHING;
