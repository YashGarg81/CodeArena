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

echo "[restore] Starting restore from $ARCHIVE to $TARGET_DB"
START_TIME=$(date +%s)

# Validate archive exists
if [ ! -f "$ARCHIVE" ]; then
  echo "[restore] ERROR: archive not found: $ARCHIVE" >&2
  exit 1
fi

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  echo "[restore] ERROR: Container $DB_CONTAINER is not running" >&2
  exit 1
fi

# Safety check for production database
if [ "$TARGET_DB" = "codearena" ] && [ "$CONFIRM" != "--yes" ]; then
  echo "[restore] REFUSING to overwrite production database '$TARGET_DB' without --yes" >&2
  exit 1
fi

# Verify archive before restore
echo "[restore] Verifying archive integrity..."
ABS_DIR="$(cd "$(dirname "$ARCHIVE")" && pwd)"
ARCHIVE_NAME="$(basename "$ARCHIVE")"
if [ -n "${MSYSTEM:-}" ] || [ "${OSTYPE:-}" = "msys" ]; then
  export MSYS_NO_PATHCONV=1
  ABS_DIR="$(cd "$(dirname "$ARCHIVE")" && pwd -W)"
fi

TABLES=$(docker run --rm -v "$ABS_DIR:/b:ro" postgres:16-alpine pg_restore --list "/b/$ARCHIVE_NAME" 2>/dev/null | grep -c "TABLE DATA" || true)
if [ "$TABLES" -lt 1 ]; then
  echo "[restore] ERROR: Archive verification failed (no table data)" >&2
  exit 1
fi
echo "[restore] Archive verified: $TABLES tables with data"

# Create target database if not exists
echo "[restore] Creating scratch database '$TARGET_DB' (if missing)..."
docker exec "$DB_CONTAINER" psql -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='$TARGET_DB'" | grep -q 1 \
  || docker exec "$DB_CONTAINER" psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE \"$TARGET_DB\""

# Restore with clean and if-exists flags
echo "[restore] Restoring $ARCHIVE -> $TARGET_DB ..."
docker exec -i "$DB_CONTAINER" pg_restore -U "$POSTGRES_USER" -d "$TARGET_DB" --clean --if-exists --no-owner --no-privileges < "$ARCHIVE" \
  || docker exec -i "$DB_CONTAINER" pg_restore -U "$POSTGRES_USER" -d "$TARGET_DB" --no-owner --no-privileges < "$ARCHIVE"

RESTORE_EXIT=$?
if [ $RESTORE_EXIT -ne 0 ]; then
  echo "[restore] ERROR: pg_restore failed with exit code $RESTORE_EXIT" >&2
  exit 1
fi

# Verify restored row counts
echo "[restore] Verifying restored row counts..."
ROW_COUNTS=$(docker exec "$DB_CONTAINER" psql -U "$POSTGRES_USER" -d "$TARGET_DB" -t -c \
  'SELECT (SELECT count(*) FROM "User"), (SELECT count(*) FROM "Problems"), (SELECT count(*) FROM "Submissions");' 2>/dev/null || echo "0 0 0")
echo "[restore] Row counts: $ROW_COUNTS"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo "[restore] Completed in ${DURATION}s"
