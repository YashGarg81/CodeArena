#!/usr/bin/env bash
# Production Fail-Closed Test Suite
# Tests that all components fail closed (no silent fallbacks) in production mode

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

log_info() { echo -e "${YELLOW}[INFO]${NC} $*"; }
log_pass() { echo -e "${GREEN}[PASS]${NC} $*"; ((PASS++)); }
log_fail() { echo -e "${RED}[FAIL]${NC} $*"; ((FAIL++)); }

# Test helpers
start_infra() {
  log_info "Starting PostgreSQL and Redis..."
  docker run -d --name test_postgres \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgrespassword \
    -e POSTGRES_DB=codearena \
    -p 5432:5432 \
    postgres:16-alpine >/dev/null
  docker run -d --name test_redis \
    -p 6379:6379 \
    redis:7-alpine >/dev/null
  sleep 3
}

stop_infra() {
  docker rm -f test_postgres test_redis >/dev/null 2>&1 || true
}

test_backend_startup() {
  local name="$1"
  local env_extra="$2"
  local should_pass="$3"
  
  log_info "Testing backend: $name"
  docker run --rm --network host \
    -e NODE_ENV=production \
    -e DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/codearena?schema=public" \
    -e REDIS_URL="redis://localhost:6379" \
    -e JWT_SECRET="strong_secret_32_characters_minimum_here" \
    -e CORS_ORIGIN="http://localhost:3003" \
    -e SANDBOX_MODE=docker \
    $env_extra \
    codearena-backend:ci \
    timeout 10 bun run --eval "
      import('./src/config.ts').then(() => console.log('OK')).catch(e => { console.error(e.message); process.exit(1); })
    " >/dev/null 2>&1
  local exit_code=$?
  
  if [ "$should_pass" = "true" ] && [ $exit_code -eq 0 ]; then
    log_pass "$name: started successfully"
  elif [ "$should_pass" = "false" ] && [ $exit_code -ne 0 ]; then
    log_pass "$name: failed closed as expected"
  elif [ "$should_pass" = "true" ] && [ $exit_code -ne 0 ]; then
    log_fail "$name: should have started but failed"
  else
    log_fail "$name: should have failed but started"
  fi
}

# Build images first
log_info "Checking Docker images..."
if docker image inspect codearena-backend:ci >/dev/null 2>&1 && docker image inspect codearena-worker:ci >/dev/null 2>&1; then
  log_pass "Docker images already exist"
else
  log_info "Building Docker images..."
  docker build -t codearena-backend:ci -f backend/Dockerfile . >/dev/null 2>&1
  docker build -t codearena-worker:ci -f worker/Dockerfile . >/dev/null 2>&1
  log_pass "Docker images built"
fi

# ===== TEST 1: PostgreSQL unavailable =====
log_info "=== Test 1: PostgreSQL unavailable ==="
stop_infra
test_backend_startup "PostgreSQL unavailable" "" "false"

# ===== TEST 2: Redis unavailable =====
log_info "=== Test 2: Redis unavailable ==="
start_infra
docker stop test_redis >/dev/null
test_backend_startup "Redis unavailable" "" "false"
docker start test_redis >/dev/null
sleep 2

# ===== TEST 3: Weak JWT secret (< 32 chars) =====
log_info "=== Test 3: Weak JWT secret ==="
test_backend_startup "Weak JWT secret" "-e JWT_SECRET=weak" "false"

# ===== TEST 4: Placeholder JWT secret =====
log_info "=== Test 4: Placeholder JWT secret ==="
test_backend_startup "Placeholder JWT secret" "-e JWT_SECRET=change-me-set-JWT_SECRET-before-production" "false"

# ===== TEST 5: Valid startup =====
log_info "=== Test 5: Valid production config ==="
test_backend_startup "Valid config" "" "true"

# ===== TEST 6: Worker cannot reach PostgreSQL =====
log_info "=== Test 6: Worker cannot reach PostgreSQL ==="
docker stop test_postgres >/dev/null
log_info "Testing worker: PostgreSQL unavailable"
docker run --rm --network host \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/codearena?schema=public" \
  -e REDIS_URL="redis://localhost:6379" \
  -e SANDBOX_MODE=docker \
  codearena-worker:ci \
  timeout 10 bun run --eval "
    import('./db.ts').then(m => m.assertWorkerPostgres()).then(() => console.log('OK')).catch(e => { console.error(e.message); process.exit(1); })
  " >/dev/null 2>&1
if [ $? -ne 0 ]; then
  log_pass "Worker: PostgreSQL unavailable - failed closed"
else
  log_fail "Worker: PostgreSQL unavailable - should have failed"
fi
docker start test_postgres >/dev/null
sleep 3

# ===== TEST 7: Worker cannot reach Redis =====
log_info "=== Test 7: Worker cannot reach Redis ==="
docker stop test_redis >/dev/null
log_info "Testing worker: Redis unavailable"
timeout 15 docker run --rm --network host \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/codearena?schema=public" \
  -e REDIS_URL="redis://localhost:6379" \
  -e SANDBOX_MODE=docker \
  codearena-worker:ci \
  bun run index.ts >/dev/null 2>&1 &
WORKER_PID=$!
sleep 5
# Worker should not consume from queue if Redis is down
docker logs $WORKER_PID 2>&1 | grep -q "Worker startup failed\|Redis.*unavailable\|ECONNREFUSED" && RESULT=0 || RESULT=1
kill $WORKER_PID 2>/dev/null || true
if [ $RESULT -eq 0 ]; then
  log_pass "Worker: Redis unavailable - failed to start/connect"
else
  log_fail "Worker: Redis unavailable - should not consume"
fi
docker start test_redis >/dev/null
sleep 2

# ===== TEST 8: Docker unavailable for judge =====
log_info "=== Test 8: Docker unavailable for judge ==="
log_info "Testing judge: Docker unavailable"
docker run --rm --network host \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/codearena?schema=public" \
  -e REDIS_URL="redis://localhost:6379" \
  -e JWT_SECRET="strong_secret_32_characters_minimum_here" \
  -e CORS_ORIGIN="http://localhost:3003" \
  -e SANDBOX_MODE=docker \
  codearena-backend:ci \
  timeout 10 bun run --eval "
    import('./src/sandbox/dockerRunner.ts').then(m => m.isDockerAvailable()).then(avail => {
      if (avail) { console.error('Docker should be unavailable'); process.exit(1); }
      console.log('OK - Docker correctly unavailable');
    }).catch(e => { console.error(e.message); process.exit(1); })
  " >/dev/null 2>&1
if [ $? -eq 0 ]; then
  log_pass "Judge: Docker unavailable - correctly detected"
else
  log_fail "Judge: Docker unavailable - detection failed"
fi

# ===== TEST 9: /ready endpoint with Redis down =====
log_info "=== Test 9: /ready endpoint returns 503 when Redis down ==="
docker stop test_redis >/dev/null
sleep 2
docker run -d --name test_backend --network host \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/codearena?schema=public" \
  -e REDIS_URL="redis://localhost:6379" \
  -e JWT_SECRET="strong_secret_32_characters_minimum_here" \
  -e CORS_ORIGIN="http://localhost:3003" \
  -e SANDBOX_MODE=docker \
  codearena-backend:ci >/dev/null
sleep 3
READY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ready 2>/dev/null || echo "000")
docker stop test_backend >/dev/null 2>&1
docker start test_redis >/dev/null
if [ "$READY_STATUS" = "503" ]; then
  log_pass "/ready returns 503 when Redis unavailable"
else
  log_fail "/ready returned $READY_STATUS instead of 503"
fi

# ===== TEST 10: Mock Docker in production =====
log_info "=== Test 10: MOCK_DOCKER=true in production ==="
test_backend_startup "MOCK_DOCKER in production" "-e MOCK_DOCKER=true" "false"

# ===== TEST 11: Process sandbox in production =====
log_info "=== Test 11: SANDBOX_MODE=process in production ==="
test_backend_startup "Process sandbox in production" "-e SANDBOX_MODE=process -e ALLOW_PROCESS_SANDBOX=true" "false"

# Summary
stop_infra
echo ""
echo "================== SUMMARY =================="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo "============================================="
[ $FAIL -eq 0 ] && exit 0 || exit 1