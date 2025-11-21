#!/bin/bash

# UltraCore Database Manager
# Backup, restore, and manage PostgreSQL database

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DB_NAME="${POSTGRES_DB:-ultracore}"
DB_USER="${POSTGRES_USER:-postgres}"
BACKUP_DIR="./backups"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Show help
show_help() {
    cat << EOF
${BLUE}╔═══════════════════════════════════════════════════════╗
║         UltraCore Database Manager                    ║
╚═══════════════════════════════════════════════════════╝${NC}

${GREEN}USAGE:${NC}
  ./db-manager.sh <command> [options]

${GREEN}COMMANDS:${NC}

  ${YELLOW}backup${NC}              Create database backup
  ${YELLOW}restore${NC} <file>      Restore database from backup
  ${YELLOW}list-backups${NC}        List all backups
  ${YELLOW}psql${NC}                Open PostgreSQL shell
  ${YELLOW}query${NC} "<sql>"       Execute SQL query
  ${YELLOW}stats${NC}               Show database statistics
  ${YELLOW}reset${NC}               Reset database (WARNING: deletes all data)
  ${YELLOW}export-csv${NC} <table>  Export table to CSV
  ${YELLOW}import-csv${NC} <file>   Import CSV into table

${GREEN}EXAMPLES:${NC}
  # Create backup
  ./db-manager.sh backup

  # Restore from backup
  ./db-manager.sh restore backups/ultracore_2024-01-21.sql

  # Open psql shell
  ./db-manager.sh psql

  # Execute query
  ./db-manager.sh query "SELECT COUNT(*) FROM deployments"

  # Export deployments to CSV
  ./db-manager.sh export-csv deployments

EOF
}

# Create backup
create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/${DB_NAME}_${timestamp}.sql"

    echo -e "${BLUE}📦 Creating database backup...${NC}"
    echo "   Database: $DB_NAME"
    echo "   File: $backup_file"
    echo ""

    docker-compose exec -T postgres pg_dump -U "$DB_USER" "$DB_NAME" > "$backup_file"

    if [ $? -eq 0 ]; then
        local size=$(du -h "$backup_file" | cut -f1)
        echo -e "${GREEN}✅ Backup created successfully${NC}"
        echo "   File: $backup_file"
        echo "   Size: $size"
    else
        echo -e "${RED}❌ Backup failed${NC}"
        exit 1
    fi
}

# Restore backup
restore_backup() {
    local backup_file=$1

    if [ -z "$backup_file" ]; then
        echo -e "${RED}❌ Error: Backup file required${NC}"
        echo "Usage: $0 restore <backup-file>"
        exit 1
    fi

    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}❌ Error: Backup file not found: $backup_file${NC}"
        exit 1
    fi

    echo -e "${YELLOW}⚠️  WARNING: This will overwrite the current database!${NC}"
    echo -n "Are you sure? (yes/no): "
    read -r confirmation

    if [ "$confirmation" != "yes" ]; then
        echo "Restore cancelled"
        exit 0
    fi

    echo -e "${BLUE}📥 Restoring database from backup...${NC}"
    echo "   File: $backup_file"
    echo ""

    # Drop existing database and recreate
    docker-compose exec -T postgres psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;"
    docker-compose exec -T postgres psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"

    # Restore from backup
    cat "$backup_file" | docker-compose exec -T postgres psql -U "$DB_USER" "$DB_NAME"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database restored successfully${NC}"
    else
        echo -e "${RED}❌ Restore failed${NC}"
        exit 1
    fi
}

# List backups
list_backups() {
    echo -e "${BLUE}📋 Available backups:${NC}"
    echo ""

    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        echo "No backups found"
        return
    fi

    printf "%-40s %-10s %-20s\n" "File" "Size" "Date"
    printf "%-40s %-10s %-20s\n" "────" "────" "────"

    for file in "$BACKUP_DIR"/*.sql; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            local size=$(du -h "$file" | cut -f1)
            local date=$(stat -c %y "$file" 2>/dev/null || stat -f %Sm "$file" 2>/dev/null | cut -d' ' -f1-2)
            printf "%-40s %-10s %-20s\n" "$filename" "$size" "$date"
        fi
    done
}

# Open psql shell
open_psql() {
    echo -e "${BLUE}🐘 Opening PostgreSQL shell...${NC}"
    echo "   Database: $DB_NAME"
    echo "   User: $DB_USER"
    echo ""
    echo "Tip: Use \\q to exit, \\dt to list tables, \\d <table> to describe table"
    echo ""

    docker-compose exec postgres psql -U "$DB_USER" "$DB_NAME"
}

# Execute query
execute_query() {
    local query=$1

    if [ -z "$query" ]; then
        echo -e "${RED}❌ Error: Query required${NC}"
        echo "Usage: $0 query \"<sql-query>\""
        exit 1
    fi

    echo -e "${BLUE}🔍 Executing query...${NC}"
    echo ""

    docker-compose exec -T postgres psql -U "$DB_USER" "$DB_NAME" -c "$query"
}

# Show database stats
show_stats() {
    echo -e "${BLUE}📊 Database Statistics${NC}"
    echo ""

    echo -e "${GREEN}Table Sizes:${NC}"
    local query="SELECT
        schemaname as schema,
        tablename as table,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
    docker-compose exec -T postgres psql -U "$DB_USER" "$DB_NAME" -c "$query"

    echo ""
    echo -e "${GREEN}Row Counts:${NC}"
    local tables=("deployments" "tenants" "bundles" "agent_logs")
    for table in "${tables[@]}"; do
        local count=$(docker-compose exec -T postgres psql -U "$DB_USER" "$DB_NAME" -t -c "SELECT COUNT(*) FROM $table" 2>/dev/null | tr -d ' ')
        printf "  %-20s %s\n" "$table:" "$count"
    done

    echo ""
    echo -e "${GREEN}Database Size:${NC}"
    local db_size=$(docker-compose exec -T postgres psql -U "$DB_USER" "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'))" | tr -d ' ')
    echo "  Total: $db_size"
}

# Reset database
reset_database() {
    echo -e "${RED}⚠️  WARNING: This will DELETE ALL DATA!${NC}"
    echo -n "Type 'DELETE ALL DATA' to confirm: "
    read -r confirmation

    if [ "$confirmation" != "DELETE ALL DATA" ]; then
        echo "Reset cancelled"
        exit 0
    fi

    echo -e "${BLUE}🔄 Resetting database...${NC}"

    # Drop and recreate database
    docker-compose exec -T postgres psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;"
    docker-compose exec -T postgres psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"

    # Run initialization script
    if [ -f "init-db.sql" ]; then
        cat init-db.sql | docker-compose exec -T postgres psql -U "$DB_USER" "$DB_NAME"
        echo -e "${GREEN}✅ Database reset and reinitialized${NC}"
    else
        echo -e "${YELLOW}⚠️  Database reset, but init-db.sql not found${NC}"
    fi
}

# Export table to CSV
export_csv() {
    local table=$1

    if [ -z "$table" ]; then
        echo -e "${RED}❌ Error: Table name required${NC}"
        echo "Usage: $0 export-csv <table-name>"
        exit 1
    fi

    local output_file="$BACKUP_DIR/${table}_$(date +%Y%m%d_%H%M%S).csv"

    echo -e "${BLUE}📤 Exporting table to CSV...${NC}"
    echo "   Table: $table"
    echo "   File: $output_file"
    echo ""

    local query="COPY $table TO STDOUT WITH CSV HEADER"
    docker-compose exec -T postgres psql -U "$DB_USER" "$DB_NAME" -c "$query" > "$output_file"

    if [ $? -eq 0 ]; then
        local size=$(du -h "$output_file" | cut -f1)
        local rows=$(wc -l < "$output_file")
        echo -e "${GREEN}✅ Export completed${NC}"
        echo "   File: $output_file"
        echo "   Size: $size"
        echo "   Rows: $((rows - 1))"
    else
        echo -e "${RED}❌ Export failed${NC}"
        exit 1
    fi
}

# Import CSV
import_csv() {
    local csv_file=$1

    if [ -z "$csv_file" ]; then
        echo -e "${RED}❌ Error: CSV file required${NC}"
        echo "Usage: $0 import-csv <csv-file>"
        exit 1
    fi

    if [ ! -f "$csv_file" ]; then
        echo -e "${RED}❌ Error: File not found: $csv_file${NC}"
        exit 1
    fi

    # Extract table name from filename
    local table=$(basename "$csv_file" | sed 's/_[0-9]*\.csv$//')

    echo -e "${BLUE}📥 Importing CSV...${NC}"
    echo "   File: $csv_file"
    echo "   Table: $table"
    echo ""

    local query="COPY $table FROM STDIN WITH CSV HEADER"
    cat "$csv_file" | docker-compose exec -T postgres psql -U "$DB_USER" "$DB_NAME" -c "$query"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Import completed${NC}"
    else
        echo -e "${RED}❌ Import failed${NC}"
        exit 1
    fi
}

# Main command router
case "${1:-help}" in
    help|--help|-h)
        show_help
        ;;
    backup)
        create_backup
        ;;
    restore)
        restore_backup "$2"
        ;;
    list-backups)
        list_backups
        ;;
    psql)
        open_psql
        ;;
    query)
        execute_query "$2"
        ;;
    stats)
        show_stats
        ;;
    reset)
        reset_database
        ;;
    export-csv)
        export_csv "$2"
        ;;
    import-csv)
        import_csv "$2"
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
