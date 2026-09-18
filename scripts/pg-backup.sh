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
COMPRESSION="${COMPRESSION:-true}"
VERIFY="${VERIFY:-true}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="$BACKUP_DIR/codearena_${STAMP}.dump"

echo "[backup] Starting backup of $POSTGRES_DB from $DB_CONTAINER -> $OUT"
START_TIME=$(date +%s)

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  echo "[backup] ERROR: Container $DB_CONTAINER is not running" >&2
  exit 1
fi

# Perform backup with optional compression
echo "[backup] Dumping database..."
if [ "$COMPRESSION" = "true" ]; then
  docker exec "$DB_CONTAINER" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -Z 3 > "$OUT"
else
  docker exec "$DB_CONTAINER" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "$OUT"
fi

DUMP_EXIT_CODE=$?
if [ $DUMP_EXIT_CODE -ne 0 ]; then
  echo "[backup] ERROR: pg_dump failed with exit code $DUMP_EXIT_CODE" >&2
  rm -f "$OUT"
  exit 1
fi

DUMP_SIZE=$(du -h "$OUT" | cut -f1)
echo "[backup] Dump completed: $DUMP_SIZE"

# Verify archive integrity
if [ "$VERIFY" = "true" ]; then
  echo "[backup] Verifying archive integrity..."
  ABS_DIR="$(cd "$BACKUP_DIR" && pwd)"
  if [ -n "${MSYSTEM:-}" ] || [ "${OSTYPE:-}" = "msys" ]; then
    export MSYS_NO_PATHCONV=1
    ABS_DIR="$(cd "$BACKUP_DIR" && pwd -W)"
  fi
  
  TABLES=$(docker run --rm -v "$ABS_DIR:/b:ro" postgres:16-alpine pg_restore --list "/b/$(basename "$OUT")" 2>/dev/null | grep -c "TABLE DATA" || true)
  if [ "$TABLES" -lt 1 ]; then
    echo "[backup] ERROR: Archive verification failed (no table data)" >&2
    exit 1
  fi
  echo "[backup] OK: $TABLES tables with data in archive"
  
  # Additional verification: check dump can be read
  echo "[backup] Performing deep verification..."
  DEEP_CHECK=$(docker run --rm -v "$ABS_DIR:/b:ro" postgres:16-alpine pg_restore --list "/b/$(basename "$OUT")" 2>&1 | head -5 || true)
  echo "[backup] Archive structure: $DEEP_CHECK"
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "[backup] Pruning to last $RETENTION archives..."
# shellcheck disable=SC2012
(ls -1t "$BACKUP_DIR"/codearena_*.dump 2>/dev/null || true) | tail -n +$((RETENTION + 1)) | xargs -r rm -f
REMAINING=$(ls -1 "$BACKUP_DIR"/codearena_*.dump 2>/dev/null | wc -l)

echo "[backup] Completed in ${DURATION}s: $OUT ($DUMP_SIZE, $TABLES tables, $REMAINING backups retained)"
