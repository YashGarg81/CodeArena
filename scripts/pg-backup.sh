#!/usr/bin/env bash
# CodeArena PostgreSQL backup (custom format) with retention + verify.
# Usage:
#   DB_CONTAINER=codearena_postgres POSTGRES_USER=postgres POSTGRES_DB=codearena \
#   BACKUP_DIR=./backups RETENTION=14 ./scripts/pg-backup.sh
set -euo pipefail

DB_CONTAINER="${DB_CONTAINER:-codearena_postgres}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-codearena}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION="${RETENTION:-14}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="$BACKUP_DIR/codearena_${STAMP}.dump"

echo "[backup] dumping $POSTGRES_DB from $DB_CONTAINER -> $OUT"
docker exec "$DB_CONTAINER" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "$OUT"

echo "[backup] verifying archive (inside postgres image: no local pg tools needed)..."
ABS_DIR="$(cd "$BACKUP_DIR" && pwd)"
if [ -n "${MSYSTEM:-}" ] || [ "${OSTYPE:-}" = "msys" ]; then
  # Git-Bash/MSYS2 rewrites absolute args like /b/... into B:/... which breaks
  # container paths. Disable conversion and hand docker a Windows-style host path.
  export MSYS_NO_PATHCONV=1
  ABS_DIR="$(cd "$BACKUP_DIR" && pwd -W)"
fi
TABLES=$(docker run --rm -v "$ABS_DIR:/b:ro" postgres:16-alpine pg_restore --list "/b/$(basename "$OUT")" 2>/dev/null | grep -c "TABLE DATA" || true)
if [ "$TABLES" -lt 1 ]; then
  echo "[backup] ERROR: archive verification failed (no table data)" >&2
  exit 1
fi
echo "[backup] OK: $TABLES tables with data in archive"

echo "[backup] pruning to last $RETENTION archives..."
# shellcheck disable=SC2012
(ls -1t "$BACKUP_DIR"/codearena_*.dump 2>/dev/null || true) | tail -n +$((RETENTION + 1)) | xargs rm -f
echo "[backup] done: $OUT"
