# Way-Share Development Guide

## Overview

This guide provides comprehensive instructions for setting up a development environment for the Way-Share application, including local development workflows, testing procedures, and contribution guidelines.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Development Environment](#development-environment)
4. [Code Structure](#code-structure)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Database Management](#database-management)
8. [Debugging](#debugging)
9. [Code Quality](#code-quality)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

#### Node.js and Package Manager
```bash
# Install Node.js 18+ LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verify installation
node --version  # Should be 18.x.x
npm --version   # Should be 9.x.x or higher
```

#### Docker (Recommended for Database)
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# macOS
brew install docker
# Or download Docker Desktop

# Verify installation
docker --version
docker-compose --version
```

#### Git
```bash
# Ubuntu/Debian
sudo apt install git

# macOS
brew install git

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Development Tools

#### IDE/Editor Setup
**VS Code (Recommended)**
```bash
# Install VS Code
sudo snap install code --classic  # Ubuntu
# Or download from https://code.visualstudio.com/

# Install recommended extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-json
code --install-extension ms-vscode.hexeditor
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
```

**VS Code Settings**
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": [
    "./way-share-frontend",
    "./way-share-backend"
  ],
  "typescript.preferences.includePackageJsonAutoImports": "on"
}
```

#### Browser Extensions
- **React Developer Tools** - For debugging React components
- **Redux DevTools** - For debugging Redux state
- **Lighthouse** - For performance and PWA auditing

---

## Initial Setup

### 1. Clone Repository
```bash
# Clone the repository
git clone https://github.com/your-org/way-share.git
cd way-share

# Check out development branch (if exists)
git checkout develop || git checkout main
```

### 2. Install Dependencies
```bash
# Backend dependencies
cd way-share-backend
npm install

# Frontend dependencies
cd ../way-share-frontend
npm install

# Return to root
cd ..
```

### 3. Environment Configuration

#### Backend Environment
```bash
# Copy example environment file
cp way-share-backend/.env.example way-share-backend/.env

# Edit environment variables
nano way-share-backend/.env
```

**Backend Environment Variables:**
```bash
# Development settings
NODE_ENV=development
PORT=3001

# Database (using Docker)
DATABASE_URL=postgresql://wayshare_dev:dev_password@localhost:5432/wayshare_development

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=development-jwt-secret-change-in-production
JWT_REFRESH_SECRET=development-refresh-secret-change-in-production

# CORS (allow frontend)
CORS_ORIGIN=http://localhost:5173

# Email (for development - use Mailtrap or similar)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
EMAIL_FROM=dev@wayshare.local

# Redis (optional, defaults to localhost:6379)
REDIS_URL=redis://localhost:6379

# Stripe (use test keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
STRIPE_WEBHOOK_SECRET=whsec_test_webhook_secret

# Logging
LOG_LEVEL=debug
```

#### Frontend Environment
```bash
# Copy example environment file
cp way-share-frontend/.env.example way-share-frontend/.env

# Edit environment variables
nano way-share-frontend/.env
```

**Frontend Environment Variables:**
```bash
# API Configuration
VITE_API_URL=http://localhost:3001/api/v1
VITE_API_URL_V2=http://localhost:3001/api/v2
VITE_ENV=development

# Mapbox Token (required for maps)
VITE_MAPBOX_TOKEN=your_mapbox_token_here

# Stripe (test keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_key
```

### 4. Database Setup

#### Option 1: Docker (Recommended)
```bash
# Start PostgreSQL and Redis with Docker Compose
docker-compose up -d postgres redis

# Wait for services to be ready
sleep 30

# Apply database migrations
cd way-share-backend
npm run migrate
```

#### Option 2: Local PostgreSQL
```bash
# Install PostgreSQL and PostGIS
sudo apt install postgresql postgresql-contrib postgis

# Create database user
sudo -u postgres createuser wayshare_dev --createdb --pwprompt
# Enter password: dev_password

# Create database
sudo -u postgres createdb wayshare_development --owner wayshare_dev

# Enable PostGIS extension
sudo -u postgres psql wayshare_development -c "CREATE EXTENSION postgis;"

# Apply migrations
cd way-share-backend
npm run migrate
```

---

## Development Environment

### Starting Development Servers

#### Method 1: Docker Compose (Full Stack)
```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Method 2: Individual Services (Recommended for Development)
```bash
# Terminal 1: Start database services
docker-compose up -d postgres redis

# Terminal 2: Start backend
cd way-share-backend
npm run dev

# Terminal 3: Start frontend
cd way-share-frontend
npm run dev
```

### Development URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health
- **PostgreSQL**: localhost:5432 (docker) or standard port if local
- **Redis**: localhost:6379

### Hot Reloading
Both frontend and backend support hot reloading:
- **Frontend**: Vite provides instant hot module replacement
- **Backend**: Nodemon automatically restarts on file changes

---

## Code Structure

### Frontend Architecture (`way-share-frontend/src/`)

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components (Button, FormField, etc.)
│   ├── layout/          # Layout components (Header, Layout)
│   ├── auth/            # Authentication components
│   ├── admin/           # Admin dashboard components
│   └── ...              # Feature-specific components
├── features/            # Feature-specific components and logic
│   ├── report/          # Incident reporting flow
│   ├── map/             # Map and heat map components
│   ├── auth/            # Authentication flows
│   └── ...              # Other features
├── pages/               # Route-level page components
│   ├── HomePage.tsx
│   ├── MapPage.tsx
│   └── ...
├── store/               # Redux Toolkit store
│   ├── api/             # RTK Query API slices
│   ├── slices/          # Redux slices
│   └── store.ts         # Store configuration
├── services/            # Utility services
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── styles/              # Global styles and theme
```

### Backend Architecture (`way-share-backend/src/`)

```
src/
├── controllers/         # Request handlers
│   ├── authController.ts
│   ├── reportController.ts
│   └── ...
├── routes/              # Express route definitions
│   ├── authRoutes.ts
│   ├── reportRoutes.ts
│   └── ...
├── services/            # Business logic layer
│   ├── authService.ts
│   ├── reportService.ts
│   ├── database.ts
│   └── ...
├── middleware/          # Express middleware
│   ├── auth.ts
│   ├── validation.ts
│   └── errorHandler.ts
├── utils/               # Utility functions
│   ├── anonymization.ts
│   └── ...
├── types/               # TypeScript type definitions
└── config/              # Configuration files
```

### Component Development Guidelines

#### React Component Structure
```tsx
// components/common/Button.tsx
import React from 'react';
import { Button as MuiButton, ButtonProps } from '@mui/material';

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
}

export const Button: React.FC<CustomButtonProps> = ({
  loading = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <MuiButton
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </MuiButton>
  );
};
```

#### API Controller Structure
```typescript
// controllers/exampleController.ts
import { Request, Response } from 'express';
import { exampleService } from '../services/exampleService';
import { validationResult } from 'express-validator';

export const exampleController = {
  async createExample(req: Request, res: Response) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array()
          }
        });
      }

      // Process request
      const result = await exampleService.createExample(req.body);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred'
        }
      });
    }
  }
};
```

---

## Development Workflow

### Feature Development

#### 1. Create Feature Branch
```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

#### 2. Development Process
```bash
# Make changes to code
# Test changes locally
npm run dev

# Run tests
npm test

# Check linting
npm run lint

# Type checking
npm run type-check
```

#### 3. Commit Changes
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new incident type selector

- Added support for subcategory selection
- Improved validation for license plate requirements
- Updated tests for new component behavior"
```

#### 4. Push and Create PR
```bash
# Push feature branch
git push origin feature/your-feature-name

# Create pull request via GitHub web interface
# Or using GitHub CLI
gh pr create --title "Add new incident type selector" --body "Description of changes"
```

### Code Review Process

#### Before Submitting PR
- [ ] All tests pass
- [ ] Linting passes without errors
- [ ] TypeScript compilation succeeds
- [ ] Manual testing completed
- [ ] Documentation updated if needed

#### PR Checklist
- [ ] Clear, descriptive title
- [ ] Detailed description of changes
- [ ] Screenshots for UI changes
- [ ] Breaking changes noted
- [ ] Migration scripts included if needed

### Git Workflow

#### Branch Naming Convention
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements

#### Commit Message Format
```
type(scope): description

Longer description if needed

- List of changes
- Another change

Closes #issue-number
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Testing
- `chore` - Maintenance

---

## Testing

### Frontend Testing

#### Unit Tests with Jest and Testing Library
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test Button.test.tsx
```

#### Component Test Example
```typescript
// src/components/__tests__/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../common/Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### Backend Testing

#### API Tests with Jest and Supertest
```bash
# Run backend tests
cd way-share-backend
npm test

# Run specific test file
npm test auth.test.js

# Run tests with coverage
npm run test:coverage
```

#### API Test Example
```typescript
// tests/auth.test.ts
import request from 'supertest';
import app from '../src/app';
import { setupTestDatabase, teardownTestDatabase } from './helpers/database';

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPass123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(userData.email);
    });

    it('should reject invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'TestPass123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
```

### End-to-End Testing

#### Playwright Setup (Optional)
```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Run E2E tests
npm run test:e2e
```

#### E2E Test Example
```typescript
// tests/e2e/report-submission.spec.ts
import { test, expect } from '@playwright/test';

test('user can submit incident report', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:5173');

  // Start reporting process
  await page.click('[data-testid="start-report-button"]');

  // Select incident type
  await page.click('[data-testid="incident-type-speeding"]');

  // Enter license plate if required
  const licensePlateInput = page.locator('[data-testid="license-plate-input"]');
  if (await licensePlateInput.isVisible()) {
    await licensePlateInput.fill('ABC123');
  }

  // Set location
  await page.click('[data-testid="use-current-location"]');

  // Add description
  await page.fill('[data-testid="description-input"]', 'Vehicle was speeding in school zone');

  // Submit report
  await page.click('[data-testid="submit-report"]');

  // Verify success
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

---

## Database Management

### Migrations

#### Creating Migrations
```bash
# Create a new migration file
cd way-share-backend
npm run migration:create add_new_table

# This creates: database/migrations/YYYYMMDD_HHMMSS_add_new_table.sql
```

#### Migration File Structure
```sql
-- database/migrations/20250710_120000_add_user_preferences.sql

-- Forward migration
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notifications BOOLEAN DEFAULT true,
    newsletter BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Verification queries
DO $$
BEGIN
    -- Check that table was created
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
        RAISE EXCEPTION 'Migration failed: user_preferences table was not created';
    END IF;
    
    -- Check that indexes were created
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_preferences_user_id') THEN
        RAISE EXCEPTION 'Migration failed: user_preferences index was not created';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully: user_preferences table and indexes created';
END $$;
```

#### Running Migrations
```bash
# Apply all pending migrations
npm run migrate

# Or manually apply specific migration
psql $DATABASE_URL -f database/migrations/20250710_120000_add_user_preferences.sql
```

### Database Utilities

#### Database Reset (Development Only)
```bash
# Reset database to clean state
npm run db:reset

# This will:
# 1. Drop all tables
# 2. Recreate database structure
# 3. Apply all migrations
# 4. Seed with test data (if seed file exists)
```

#### Seeding Test Data
```bash
# Create seed file
touch database/seeds/test_data.sql

# Add test data
cat > database/seeds/test_data.sql << 'EOF'
-- Insert test users
INSERT INTO users (id, email, password_hash, first_name, last_name, is_verified, role) 
VALUES 
    (gen_random_uuid(), 'user@test.com', '$argon2id$v=19$m=65536,t=3,p=4$...', 'Test', 'User', true, 'user'),
    (gen_random_uuid(), 'admin@test.com', '$argon2id$v=19$m=65536,t=3,p=4$...', 'Admin', 'User', true, 'admin');

-- Insert test incident types
INSERT INTO incident_type_metadata (incident_type, requires_license_plate, category, subcategories) 
VALUES 
    ('speeding', true, 'Vehicle', '["Excessive speeding", "School zone violation"]'),
    ('potholes', false, 'Infrastructure', '["Large pothole", "Multiple potholes"]');
EOF

# Apply seed data
npm run db:seed
```

### Database Queries and Analysis

#### Common Development Queries
```sql
-- Check recent reports
SELECT 
    id, 
    incident_type, 
    ST_AsText(location) as location_text,
    created_at 
FROM reports 
ORDER BY created_at DESC 
LIMIT 10;

-- Analyze incident types distribution
SELECT 
    incident_type, 
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reports), 2) as percentage
FROM reports 
GROUP BY incident_type 
ORDER BY count DESC;

-- Check database size
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Monitor database connections
SELECT 
    count(*) as total_connections,
    count(*) FILTER (WHERE state = 'active') as active_connections,
    count(*) FILTER (WHERE state = 'idle') as idle_connections
FROM pg_stat_activity;
```

---

## Debugging

### Frontend Debugging

#### Browser DevTools
```typescript
// Add debug logging
console.log('Component rendered with props:', props);
console.table(state);

// Debug Redux state
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const debugSelector = (state: RootState) => ({
  auth: state.auth,
  reports: state.reports,
  // Add other slices as needed
});

// In component
const debugState = useSelector(debugSelector);
console.log('Redux state:', debugState);
```

#### React DevTools
- Install React DevTools browser extension
- Use Components tab to inspect component tree
- Use Profiler tab to identify performance issues

#### Redux DevTools
- Install Redux DevTools extension
- Monitor state changes and actions
- Time-travel debugging capabilities

### Backend Debugging

#### Debug Logging
```typescript
// Add debug logging in controllers/services
import debug from 'debug';
const log = debug('wayshare:auth');

export const authController = {
  async login(req: Request, res: Response) {
    log('Login attempt for email:', req.body.email);
    
    try {
      const result = await authService.login(req.body);
      log('Login successful for user:', result.user.id);
      res.json(result);
    } catch (error) {
      log('Login failed:', error.message);
      throw error;
    }
  }
};
```

#### Environment Variables for Debugging
```bash
# Enable debug logging
DEBUG=wayshare:* npm run dev

# Enable specific modules
DEBUG=wayshare:auth,wayshare:reports npm run dev

# Enable SQL query logging
LOG_LEVEL=debug npm run dev
```

#### VS Code Debugging Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/way-share-backend/src/index.ts",
      "outFiles": ["${workspaceFolder}/way-share-backend/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      },
      "runtimeArgs": ["-r", "ts-node/register"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Database Debugging

#### Query Performance Analysis
```sql
-- Enable query timing
\timing on

-- Analyze query execution plan
EXPLAIN ANALYZE SELECT * FROM reports WHERE incident_type = 'speeding';

-- Find slow queries
SELECT 
    query,
    mean_time,
    calls,
    total_time
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

#### Connection Debugging
```bash
# Check database connectivity
psql $DATABASE_URL -c "SELECT version();"

# Test from backend container
docker exec wayshare-backend-dev node -e "
const { pool } = require('./dist/services/database');
pool.query('SELECT NOW()').then(res => console.log('DB connected:', res.rows[0]));
"
```

---

## Code Quality

### Linting and Formatting

#### ESLint Configuration
Frontend (`.eslintrc.json`):
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  }
}
```

#### Prettier Configuration
`.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

#### Pre-commit Hooks
Install Husky and lint-staged:
```bash
npm install -D husky lint-staged

# Setup pre-commit hooks
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

`package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ],
    "*.{json,md}": [
      "prettier --write",
      "git add"
    ]
  }
}
```

### Type Safety

#### TypeScript Strict Mode
`tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### Type Definitions
Create shared types:
```typescript
// types/index.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

export interface IncidentReport {
  id: string;
  incidentType: IncidentType;
  location: {
    lat: number;
    lng: number;
  };
  licensePlate?: string;
  description: string;
  subcategory?: string;
  status: ReportStatus;
  createdAt: string;
}

export enum IncidentType {
  SPEEDING = 'speeding',
  TAILGATING = 'tailgating',
  PHONE_USE = 'phone_use',
  POTHOLES = 'potholes',
  // ... other types
}

export enum ReportStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  DISMISSED = 'dismissed',
  DISPUTED = 'disputed'
}
```

### Performance Monitoring

#### Frontend Performance
```typescript
// utils/performance.ts
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Usage in components
import { measurePerformance } from '../utils/performance';

const Component = () => {
  const handleSubmit = () => {
    measurePerformance('Form submission', () => {
      // Form submission logic
    });
  };
};
```

#### Backend Performance
```typescript
// middleware/performance.ts
import { Request, Response, NextFunction } from 'express';

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    console.log(`${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
  });
  
  next();
};
```

---

## Troubleshooting

### Common Development Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3001
lsof -i :5173

# Kill process
kill -9 <PID>

# Or use different ports
PORT=3002 npm run dev  # Backend
VITE_PORT=5174 npm run dev  # Frontend
```

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection manually
docker exec wayshare-postgres-dev pg_isready -U wayshare_dev

# Reset database if corrupted
docker-compose down -v
docker-compose up -d postgres
npm run migrate
```

#### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear TypeScript cache
rm -rf .tsbuildinfo
npx tsc --build --clean
```

#### TypeScript Compilation Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Regenerate type definitions
npm run type-check

# Clear TypeScript build cache
rm -rf dist/
npm run build
```

#### Environment Variable Issues
```bash
# Check if environment variables are loaded
node -e "console.log(process.env.DATABASE_URL)"

# Verify .env file format (no spaces around =)
# Correct: DATABASE_URL=postgresql://...
# Incorrect: DATABASE_URL = postgresql://...

# Check environment file location
ls -la way-share-backend/.env
ls -la way-share-frontend/.env
```

### Performance Issues

#### Frontend Performance Problems
```bash
# Analyze bundle size
npm run build
npm run analyze  # If configured

# Check for memory leaks
# Use Chrome DevTools Memory tab

# Optimize images and assets
# Use WebP format for images
# Implement lazy loading
```

#### Backend Performance Issues
```bash
# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3001/api/v1/reports"

# Check database query performance
# See Database Debugging section

# Monitor memory usage
docker stats wayshare-backend-dev

# Profile Node.js application
node --inspect=0.0.0.0:9229 dist/index.js
```

### Docker Issues

#### Container Build Failures
```bash
# Build with no cache
docker-compose build --no-cache

# Check Docker daemon
systemctl status docker

# Clean Docker system
docker system prune -a

# Check disk space
df -h
```

#### Container Runtime Issues
```bash
# Check container logs
docker-compose logs [service-name]

# Execute commands in container
docker-compose exec backend bash
docker-compose exec frontend sh

# Check container health
docker inspect --format='{{.State.Health.Status}}' [container-name]
```

### Git and Development Workflow Issues

#### Merge Conflicts
```bash
# Pull latest changes
git pull origin main

# Resolve conflicts manually or use merge tool
git config --global merge.tool vimdiff
git mergetool

# Complete merge
git add .
git commit -m "Resolve merge conflicts"
```

#### Branch Management
```bash
# Clean up merged branches
git branch --merged | grep -v main | xargs -n 1 git branch -d

# Reset to clean state
git reset --hard HEAD
git clean -fd

# Stash changes temporarily
git stash
git stash pop
```

---

## Additional Resources

### Documentation Links
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material-UI Documentation](https://mui.com/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

### Useful Development Tools
- **Postman** - API testing and documentation
- **TablePlus** - Database management GUI
- **Redis Commander** - Redis GUI client
- **Lighthouse** - Performance and PWA auditing
- **Bundle Analyzer** - Webpack bundle analysis

### Community and Support
- [GitHub Issues](https://github.com/your-org/way-share/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react+typescript)
- [Discord/Slack Community](link-to-community-if-available)

---

**Development Guide Version**: 1.0  
**Last Updated**: July 10, 2025  
**Compatible with**: Way-Share v2.5.2+  
**Support**: For development questions, create an issue in the GitHub repository