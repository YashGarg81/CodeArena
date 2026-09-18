#!/usr/bin/env bash
# CodeArena PostgreSQL restore from a pg-backup.sh archive.
# Usage:
#   ./scripts/pg-restore.sh <archive.dump> [target_db] [--yes]
# Refuses to overwrite the production database without --yes.
set -euo pipefail

ARCHIVE="${1:?usage: pg-restore.sh <archive.dump> [target_db] [--yes]}"
TARGET_DB="${2:-codearena_restore_test}"
CONFIRM="${3:-}"

DB_CONTAINER="${DB_CONTAINER:-codearena_postgres}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"

if [ ! -f "$ARCHIVE" ]; then
  echo "[restore] ERROR: archive not found: $ARCHIVE" >&2
  exit 1
fi

if [ "$TARGET_DB" = "codearena" ] && [ "$CONFIRM" != "--yes" ]; then
  echo "[restore] REFUSING to overwrite production database '$TARGET_DB' without --yes" >&2
  exit 1
fi

echo "[restore] creating scratch database '$TARGET_DB' (if missing)..."
docker exec "$DB_CONTAINER" psql -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='$TARGET_DB'" | grep -q 1 \
  || docker exec "$DB_CONTAINER" psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE \"$TARGET_DB\""

echo "[restore] restoring $ARCHIVE -> $TARGET_DB ..."
docker exec -i "$DB_CONTAINER" pg_restore -U "$POSTGRES_USER" -d "$TARGET_DB" --clean --if-exists < "$ARCHIVE" \
  || docker exec -i "$DB_CONTAINER" pg_restore -U "$POSTGRES_USER" -d "$TARGET_DB" < "$ARCHIVE"

echo "[restore] verifying restored row counts..."
docker exec "$DB_CONTAINER" psql -U "$POSTGRES_USER" -d "$TARGET_DB" -t -c \
  'SELECT (SELECT count(*) FROM "User"), (SELECT count(*) FROM "Problems"), (SELECT count(*) FROM "Submissions");'
echo "[restore] done."
