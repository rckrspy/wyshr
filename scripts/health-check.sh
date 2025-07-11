#!/bin/bash

# Way-Share Docker Health Check Script
# Comprehensive health monitoring for all services

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="${1:-docker-compose.yml}"
MAX_RETRIES=30
RETRY_INTERVAL=10

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Docker and Docker Compose are available
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Check container health status
check_container_health() {
    local container_name="$1"
    local service_name="$2"
    
    log "Checking health of $service_name ($container_name)..."
    
    # Check if container exists and is running
    if ! docker ps --format "table {{.Names}}" | grep -q "^$container_name$"; then
        error "$service_name container is not running"
        return 1
    fi
    
    # Check health status if healthcheck is configured
    local health_status
    health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "no-healthcheck")
    
    case "$health_status" in
        "healthy")
            success "$service_name is healthy"
            return 0
            ;;
        "unhealthy")
            error "$service_name is unhealthy"
            return 1
            ;;
        "starting")
            warning "$service_name is still starting up"
            return 2
            ;;
        "no-healthcheck")
            # For containers without healthcheck, just check if running
            success "$service_name is running (no healthcheck configured)"
            return 0
            ;;
        *)
            warning "$service_name has unknown health status: $health_status"
            return 2
            ;;
    esac
}

# Test database connectivity
test_database() {
    log "Testing database connectivity..."
    
    local db_container
    if [[ "$COMPOSE_FILE" == *"prod"* ]]; then
        db_container="wayshare-postgres-prod"
    else
        db_container="wayshare-postgres-dev"
    fi
    
    if docker exec "$db_container" pg_isready -U wayshare_dev -d wayshare_development &>/dev/null ||
       docker exec "$db_container" pg_isready -U "${DB_USER:-wayshare_prod}" -d wayshare_production &>/dev/null; then
        success "Database is accepting connections"
        return 0
    else
        error "Database is not responding"
        return 1
    fi
}

# Test Redis connectivity
test_redis() {
    log "Testing Redis connectivity..."
    
    local redis_container
    if [[ "$COMPOSE_FILE" == *"prod"* ]]; then
        redis_container="wayshare-redis-prod"
    else
        redis_container="wayshare-redis-dev"
    fi
    
    if docker exec "$redis_container" redis-cli ping &>/dev/null; then
        success "Redis is responding"
        return 0
    else
        error "Redis is not responding"
        return 1
    fi
}

# Test API endpoints
test_api() {
    log "Testing API endpoints..."
    
    local backend_container
    if [[ "$COMPOSE_FILE" == *"prod"* ]]; then
        backend_container="wayshare-backend-prod"
    else
        backend_container="wayshare-backend-dev"
    fi
    
    # Test health endpoint
    if docker exec "$backend_container" curl -f http://localhost:3001/health &>/dev/null; then
        success "API health endpoint is responding"
    else
        error "API health endpoint is not responding"
        return 1
    fi
    
    # Test main API endpoint
    if docker exec "$backend_container" curl -f http://localhost:3001/api/v1/reports &>/dev/null; then
        success "API main endpoints are responding"
        return 0
    else
        warning "API main endpoints may not be fully initialized"
        return 2
    fi
}

# Test frontend
test_frontend() {
    log "Testing frontend..."
    
    local frontend_container
    if [[ "$COMPOSE_FILE" == *"prod"* ]]; then
        frontend_container="wayshare-frontend-prod"
    else
        frontend_container="wayshare-frontend-dev"
    fi
    
    if docker exec "$frontend_container" curl -f http://localhost/ &>/dev/null ||
       docker exec "$frontend_container" curl -f http://localhost:5173/ &>/dev/null; then
        success "Frontend is responding"
        return 0
    else
        error "Frontend is not responding"
        return 1
    fi
}

# Wait for services to be healthy
wait_for_services() {
    log "Waiting for services to become healthy..."
    
    local services=()
    if [[ "$COMPOSE_FILE" == *"prod"* ]]; then
        services=("wayshare-postgres-prod:Database" "wayshare-redis-prod:Redis" "wayshare-backend-prod:Backend" "wayshare-frontend-prod:Frontend")
    else
        services=("wayshare-postgres-dev:Database" "wayshare-redis-dev:Redis" "wayshare-backend-dev:Backend" "wayshare-frontend-dev:Frontend")
    fi
    
    local all_healthy=false
    local attempts=0
    
    while [[ "$all_healthy" == false && "$attempts" -lt "$MAX_RETRIES" ]]; do
        all_healthy=true
        attempts=$((attempts + 1))
        
        log "Health check attempt $attempts/$MAX_RETRIES"
        
        for service in "${services[@]}"; do
            IFS=':' read -r container_name service_name <<< "$service"
            
            if ! check_container_health "$container_name" "$service_name"; then
                all_healthy=false
            fi
        done
        
        if [[ "$all_healthy" == false ]]; then
            log "Some services are not healthy yet. Waiting $RETRY_INTERVAL seconds..."
            sleep "$RETRY_INTERVAL"
        fi
    done
    
    if [[ "$all_healthy" == true ]]; then
        success "All services are healthy!"
        return 0
    else
        error "Some services failed to become healthy after $MAX_RETRIES attempts"
        return 1
    fi
}

# Run comprehensive tests
run_tests() {
    log "Running comprehensive health tests..."
    
    local test_results=()
    
    # Test each component
    test_database && test_results+=("Database: ✓") || test_results+=("Database: ✗")
    test_redis && test_results+=("Redis: ✓") || test_results+=("Redis: ✗")
    test_api && test_results+=("API: ✓") || test_results+=("API: ✗")
    test_frontend && test_results+=("Frontend: ✓") || test_results+=("Frontend: ✗")
    
    # Print summary
    log "Health Check Summary:"
    for result in "${test_results[@]}"; do
        echo "  $result"
    done
    
    # Check if all tests passed
    if [[ "${test_results[*]}" =~ ✗ ]]; then
        error "Some health checks failed"
        return 1
    else
        success "All health checks passed!"
        return 0
    fi
}

# Show service logs for debugging
show_logs() {
    log "Showing recent logs for debugging..."
    
    echo "=== PostgreSQL Logs ==="
    docker-compose -f "$COMPOSE_FILE" logs --tail=10 postgres
    
    echo "=== Redis Logs ==="
    docker-compose -f "$COMPOSE_FILE" logs --tail=10 redis
    
    echo "=== Backend Logs ==="
    docker-compose -f "$COMPOSE_FILE" logs --tail=10 backend
    
    echo "=== Frontend Logs ==="
    docker-compose -f "$COMPOSE_FILE" logs --tail=10 frontend
}

# Main execution
main() {
    log "Starting Way-Share Docker Health Check"
    log "Using compose file: $COMPOSE_FILE"
    
    check_prerequisites
    
    case "${1:-check}" in
        "wait")
            wait_for_services
            ;;
        "test")
            run_tests
            ;;
        "logs")
            show_logs
            ;;
        "check"|*)
            wait_for_services && run_tests
            ;;
    esac
    
    local exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        success "Health check completed successfully"
    else
        error "Health check failed"
        warning "Run '$0 logs' to see recent service logs"
    fi
    
    exit $exit_code
}

# Run main function with all arguments
main "$@"