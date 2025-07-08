# Way-Share Database

**PostgreSQL database with PostGIS for spatial data processing**

---

## 📊 **Database Overview**

### **Schema Version**: 1.1.0
### **Database Engine**: PostgreSQL 14+ with PostGIS extension
### **Spatial Data**: Geographic coordinates with 100m privacy rounding

---

## 🗃️ **Database Structure**

### **Core Tables**

#### **reports**
Primary table for storing traffic incident reports with spatial data.

| Column | Type | Description | Notes |
|--------|------|-------------|--------|
| `id` | UUID | Primary key | Auto-generated |
| `session_id` | VARCHAR(255) | Anonymous session identifier | For report tracking |
| `license_plate_hash` | VARCHAR(255) | SHA-256 hashed license plate | **Nullable** in v1.1.0+ |
| `incident_type` | incident_type | Enum of incident categories | 21 types as of v1.1.0 |
| `subcategory` | VARCHAR(50) | Detailed incident classification | Added in v1.1.0 |
| `location` | GEOMETRY(Point, 4326) | Geographic coordinates | Rounded to 100m |
| `description` | TEXT | User-provided incident details | Optional |
| `created_at` | TIMESTAMP | Report submission time | UTC timezone |
| `updated_at` | TIMESTAMP | Last modification time | UTC timezone |

#### **incident_type_metadata**
Lookup table for incident type configuration and display information.

| Column | Type | Description | Notes |
|--------|------|-------------|--------|
| `incident_type` | incident_type | References enum value | Primary key |
| `requires_license_plate` | BOOLEAN | Whether license plate is required | Controls UI flow |
| `display_name` | VARCHAR(100) | Human-readable name | For UI display |
| `description` | TEXT | Detailed explanation | Help text |
| `category` | VARCHAR(50) | Vehicle or Infrastructure | Two-track system |
| `subcategories` | TEXT[] | Array of valid subcategories | JSON-like structure |

### **Custom Types**

#### **incident_type** (Enum)
Comprehensive list of traffic incident categories:

**Vehicle-Specific Types** (13):
- `speeding`, `tailgating`, `phone_use`, `failure_to_yield`
- `road_rage`, `aggressive_driving`, `reckless_driving`, `impaired_driving`
- `parking_violations`, `illegal_parking`, `handicap_violations`
- `unsecured_loads`, `littering`, `failure_to_signal`

**Infrastructure-Based Types** (8):
- `potholes`, `rock_chips`, `road_debris`, `dead_animals`
- `signal_malfunction`, `power_outage`, `fallen_trees`, `dangerous_conditions`

---

## 🔄 **Database Migrations**

### **Migration System**
- **Location**: `migrations/` directory
- **Naming**: `{version}_{description}.sql`
- **Execution**: Manual application via migration scripts

### **Applied Migrations**

#### **001_enhanced_incident_types.sql** (v1.1.0)
**Applied**: July 8, 2025  
**Description**: Enhanced incident types system with dual-track reporting

**Changes Made**:
1. **Extended incident_type enum** with 14 new values
2. **Made license_plate_hash nullable** for infrastructure hazards
3. **Added subcategory column** to reports table
4. **Created incident_type_metadata table** with configuration data
5. **Populated metadata** for all 21 incident types with subcategories
6. **Added database indexes** for optimal query performance

**Verification**:
```sql
-- Check enum values
SELECT unnest(enum_range(NULL::incident_type)) AS incident_types;

-- Verify metadata populated
SELECT COUNT(*) FROM incident_type_metadata; -- Should return 21

-- Check nullable license plate
SELECT is_nullable FROM information_schema.columns 
WHERE table_name = 'reports' AND column_name = 'license_plate_hash';
```

---

## 🚀 **Setup Instructions**

### **Initial Database Setup**

1. **Create Database**:
```bash
createdb wayshare
```

2. **Enable PostGIS Extension**:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

3. **Run Initial Schema**:
```bash
psql wayshare < init.sql
```

4. **Apply Migrations**:
```bash
psql wayshare < run_migration.sql
```

### **Docker Setup**

**Development**:
```bash
docker-compose up -d postgres
```

**Production**:
```bash
docker-compose -f docker-compose.prod.yml up -d postgres
```

---

## 📈 **Migration Guide**

### **Applying New Migrations**

1. **Backup Current Database**:
```bash
pg_dump wayshare > backup_$(date +%Y%m%d_%H%M%S).sql
```

2. **Test Migration** (on copy):
```bash
createdb wayshare_test
pg_restore -d wayshare_test backup_file.sql
psql wayshare_test < migrations/new_migration.sql
```

3. **Apply to Production**:
```bash
psql wayshare < migrations/new_migration.sql
```

4. **Verify Migration**:
```bash
psql wayshare < run_migration.sql
```

### **Rollback Strategy**

- **Database Backups**: Automated nightly backups
- **Migration Rollbacks**: Manual SQL scripts for each migration
- **Point-in-Time Recovery**: Available via WAL archiving

---

## 🔒 **Security & Privacy**

### **Data Anonymization**

#### **License Plates**
- **Hashing**: One-way SHA-256 with random salt
- **Storage**: Only hash stored, original never retained
- **Verification**: Impossible to reverse-engineer original plates

#### **Geographic Privacy**
- **Rounding**: Coordinates rounded to nearest 100m grid
- **Precision**: Accurate enough for traffic analysis, private enough for safety
- **Storage**: PostGIS GEOMETRY type with spatial indexing

### **Database Security**

#### **Access Control**
- **Non-root User**: Application connects with limited privileges
- **Role-Based Access**: Separate read/write permissions
- **Network Security**: Database isolated in Docker network

#### **Data Protection**
- **Encryption at Rest**: Database volume encryption
- **Encryption in Transit**: SSL/TLS for all connections
- **Audit Logging**: Database access logging enabled

---

## 📊 **Performance Optimization**

### **Indexing Strategy**

#### **Spatial Indexes**
```sql
-- Geographic clustering for heat map queries
CREATE INDEX idx_reports_location_gist ON reports USING GIST (location);

-- Time-based filtering
CREATE INDEX idx_reports_created_at ON reports (created_at);

-- Incident type filtering
CREATE INDEX idx_reports_incident_type ON reports (incident_type);
```

#### **Query Optimization**
- **Heat Map Queries**: Spatial clustering with ST_ClusterDBSCAN
- **Time Filtering**: B-tree indexes on timestamp columns
- **Incident Filtering**: Enum-based indexing for fast lookups

### **Performance Targets**
- **Heat Map Load**: <500ms for 10,000 reports
- **Report Insertion**: <100ms per report
- **Spatial Queries**: <200ms for geographic filtering
- **Concurrent Users**: 1,000+ simultaneous connections

---

## 🛠️ **Maintenance**

### **Regular Tasks**

#### **Daily**
- Monitor database connection pool usage
- Check for long-running queries
- Verify backup completion

#### **Weekly**
- Analyze query performance statistics
- Review database growth trends
- Update table statistics with ANALYZE

#### **Monthly**
- Rebuild spatial indexes if needed
- Archive old reports (>1 year)
- Review and optimize slow queries

### **Monitoring Queries**

#### **Database Health**
```sql
-- Connection usage
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';

-- Table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Report volume by day
SELECT DATE(created_at) as report_date, 
       COUNT(*) as reports_count,
       COUNT(DISTINCT incident_type) as incident_types_used
FROM reports 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY report_date DESC;
```

---

## 📞 **Support**

### **Common Issues**

#### **Migration Failures**
- Check PostgreSQL version compatibility (14+)
- Verify PostGIS extension is installed
- Ensure sufficient disk space for schema changes

#### **Performance Problems**
- Run VACUUM ANALYZE on reports table
- Check spatial index integrity
- Monitor connection pool settings

#### **Connection Issues**
- Verify DATABASE_URL format
- Check network connectivity
- Confirm PostgreSQL service status

### **Contact Information**
- **Database Issues**: Check deployment documentation
- **Performance Questions**: Review monitoring queries above
- **Schema Changes**: Follow migration guide procedures

---

**Database Version**: 1.1.0  
**Last Updated**: July 8, 2025  
**Next Review**: October 8, 2025