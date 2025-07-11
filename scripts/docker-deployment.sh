#!/bin/bash

# Way-Share Docker Deployment Script
# Automated deployment with health checks and rollback capabilities

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-development}"
COMPOSE_FILE=""
BACKUP_ENABLED=true
HEALTH_CHECK_TIMEOUT=300

# Set compose file based on environment
case "$ENVIRONMENT" in
    "production"|"prod")
        COMPOSE_FILE="docker-compose.prod.yml"
        ENVIRONMENT="production"
        ;;
    "development"|"dev"|*)
        COMPOSE_FILE="docker-compose.yml"
        ENVIRONMENT="development"
        ;;
esac

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

# Check prerequisites
check_prerequisites() {
    log "Checking deployment prerequisites..."
    
    # Check if required files exist
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        error "Compose file $COMPOSE_FILE not found"
        exit 1
    fi
    
    # Check environment files
    if [[ "$ENVIRONMENT" == "production" ]]; then
        if [[ ! -f "way-share-backend/.env.production" ]]; then
            error "Production environment file way-share-backend/.env.production not found"
            exit 1
        fi
        
        if [[ ! -f "way-share-frontend/.env.production" ]]; then
            error "Production environment file way-share-frontend/.env.production not found"
            exit 1
        fi
    fi
    
    # Check if .env file exists for Docker Compose variables
    if [[ ! -f ".env" ]] && [[ "$ENVIRONMENT" == "production" ]]; then
        warning "No .env file found. Make sure to set required environment variables."
        warning "Copy .env.example to .env and configure with your values."
    fi
    
    # Check Docker and Docker Compose
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

# Backup existing data (for production)
backup_data() {
    if [[ "$ENVIRONMENT" == "production" && "$BACKUP_ENABLED" == true ]]; then
        log "Creating backup of production data..."
        
        local backup_dir="backups/$(date +'%Y%m%d_%H%M%S')"
        mkdir -p "$backup_dir"
        
        # Backup database
        if docker ps --format "table {{.Names}}" | grep -q "wayshare-postgres-prod"; then
            log "Backing up PostgreSQL database..."
            docker exec wayshare-postgres-prod pg_dump -U "${DB_USER:-wayshare_prod}" wayshare_production > "$backup_dir/database_backup.sql"
            success "Database backup created: $backup_dir/database_backup.sql"
        fi
        
        # Backup Redis data
        if docker ps --format "table {{.Names}}" | grep -q "wayshare-redis-prod"; then
            log "Backing up Redis data..."
            docker exec wayshare-redis-prod redis-cli --rdb - > "$backup_dir/redis_backup.rdb" 2>/dev/null || true
            success "Redis backup created: $backup_dir/redis_backup.rdb"
        fi
        
        echo "$backup_dir" > .last_backup
        success "Backup completed: $backup_dir"
    else
        log "Backup skipped for $ENVIRONMENT environment"
    fi
}

# Pull latest images
pull_images() {
    log "Pulling latest images..."
    docker-compose -f "$COMPOSE_FILE" pull
    success "Images pulled successfully"
}

# Build services
build_services() {
    log "Building services..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    success "Services built successfully"
}

# Deploy services
deploy_services() {
    log "Deploying services..."
    
    # Stop existing services gracefully
    log "Stopping existing services..."
    docker-compose -f "$COMPOSE_FILE" down --timeout 30
    
    # Start services
    log "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    success "Services deployed successfully"
}

# Wait for services to be ready
wait_for_readiness() {
    log "Waiting for services to be ready..."
    
    # Use the health check script
    if [[ -x "scripts/health-check.sh" ]]; then
        if timeout "$HEALTH_CHECK_TIMEOUT" scripts/health-check.sh "$COMPOSE_FILE" wait; then
            success "All services are ready and healthy"
            return 0
        else
            error "Services failed to become ready within $HEALTH_CHECK_TIMEOUT seconds"
            return 1
        fi
    else
        warning "Health check script not found, waiting 60 seconds..."
        sleep 60
        success "Wait period completed"
        return 0
    fi
}

# Run health checks
run_health_checks() {
    log "Running comprehensive health checks..."
    
    if [[ -x "scripts/health-check.sh" ]]; then
        if scripts/health-check.sh "$COMPOSE_FILE" test; then
            success "All health checks passed"
            return 0
        else
            error "Health checks failed"
            return 1
        fi
    else
        warning "Health check script not found, skipping detailed health checks"
        return 0
    fi
}

# Rollback deployment
rollback_deployment() {
    error "Deployment failed. Rolling back..."
    
    # Stop current deployment
    docker-compose -f "$COMPOSE_FILE" down --timeout 30
    
    # Restore from backup if available
    if [[ -f ".last_backup" && "$ENVIRONMENT" == "production" ]]; then
        local backup_dir
        backup_dir=$(cat .last_backup)
        
        if [[ -d "$backup_dir" ]]; then
            log "Restoring from backup: $backup_dir"
            
            # Start database for restore
            docker-compose -f "$COMPOSE_FILE" up -d postgres redis
            sleep 30
            
            # Restore database
            if [[ -f "$backup_dir/database_backup.sql" ]]; then
                log "Restoring database..."
                docker exec -i wayshare-postgres-prod psql -U "${DB_USER:-wayshare_prod}" wayshare_production < "$backup_dir/database_backup.sql"
                success "Database restored"
            fi
            
            # Restore Redis data
            if [[ -f "$backup_dir/redis_backup.rdb" ]]; then
                log "Restoring Redis data..."
                docker cp "$backup_dir/redis_backup.rdb" wayshare-redis-prod:/data/dump.rdb
                docker-compose -f "$COMPOSE_FILE" restart redis
                success "Redis data restored"
            fi
            
            success "Rollback completed successfully"
        else
            error "Backup directory not found: $backup_dir"
        fi
    else
        warning "No backup available for rollback"
    fi
}

# Show deployment status
show_status() {
    log "Deployment Status:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo ""
    log "Service Health:"
    if [[ -x "scripts/health-check.sh" ]]; then
        scripts/health-check.sh "$COMPOSE_FILE" check
    else
        docker-compose -f "$COMPOSE_FILE" exec backend curl -f http://localhost:3001/health 2>/dev/null && success "Backend API is healthy" || error "Backend API is not responding"
    fi
}

# Show logs
show_logs() {
    log "Recent service logs:"
    docker-compose -f "$COMPOSE_FILE" logs --tail=20 --follow
}

# Main deployment function
deploy() {
    log "Starting Way-Share deployment to $ENVIRONMENT"
    log "Using compose file: $COMPOSE_FILE"
    
    # Pre-deployment checks
    check_prerequisites
    
    # Backup if production
    backup_data
    
    # Build and deploy
    if ! pull_images; then
        error "Failed to pull images"
        exit 1
    fi
    
    if ! build_services; then
        error "Failed to build services"
        exit 1
    fi
    
    if ! deploy_services; then
        error "Failed to deploy services"
        rollback_deployment
        exit 1
    fi
    
    # Wait for readiness
    if ! wait_for_readiness; then
        error "Services failed to become ready"
        rollback_deployment
        exit 1
    fi
    
    # Run health checks
    if ! run_health_checks; then
        error "Health checks failed"
        rollback_deployment
        exit 1
    fi
    
    success "Deployment completed successfully!"
    show_status
}

# Usage information
usage() {
    echo "Way-Share Docker Deployment Script"
    echo ""
    echo "Usage: $0 [ENVIRONMENT] [COMMAND]"
    echo ""
    echo "Environments:"
    echo "  development, dev    Deploy to development environment (default)"
    echo "  production, prod    Deploy to production environment"
    echo ""
    echo "Commands:"
    echo "  deploy              Full deployment (default)"
    echo "  status              Show deployment status"
    echo "  logs                Show service logs"
    echo "  health              Run health checks only"
    echo "  rollback            Rollback to previous version"
    echo "  backup              Create backup only"
    echo ""
    echo "Examples:"
    echo "  $0                           # Deploy to development"
    echo "  $0 production deploy         # Deploy to production"
    echo "  $0 prod status               # Show production status"
    echo "  $0 development logs          # Show development logs"
}

# Main execution
main() {
    local command="${2:-deploy}"
    
    case "$command" in
        "deploy")
            deploy
            ;;
        "status")
            check_prerequisites
            show_status
            ;;
        "logs")
            check_prerequisites
            show_logs
            ;;
        "health")
            check_prerequisites
            run_health_checks
            ;;
        "rollback")
            check_prerequisites
            rollback_deployment
            ;;
        "backup")
            check_prerequisites
            backup_data
            ;;
        "help"|"--help"|"-h")
            usage
            ;;
        *)
            error "Unknown command: $command"
            usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"