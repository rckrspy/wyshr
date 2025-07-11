"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.db = void 0;
const pg_1 = require("pg");
const config_1 = require("../config/config");
class Database {
    constructor() {
        this.isConnected = false;
        const dbConfig = {
            connectionString: config_1.config.db.url,
            ssl: false, // Disable SSL for local Docker containers
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        };
        this.pool = new pg_1.Pool(dbConfig);
        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
        });
    }
    async connect() {
        try {
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            this.isConnected = true;
            console.log('Database connected successfully');
        }
        catch (error) {
            console.error('Failed to connect to database:', error);
            throw error;
        }
    }
    async query(text, params) {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            if (config_1.config.env === 'development') {
                console.log('Query executed', { text, duration, rows: result.rowCount });
            }
            return result.rows;
        }
        catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async healthCheck() {
        try {
            const result = await this.query('SELECT NOW() as now');
            return {
                status: 'healthy',
                timestamp: result[0].now,
            };
        }
        catch {
            return {
                status: 'unhealthy',
                timestamp: new Date(),
            };
        }
    }
    async close() {
        await this.pool.end();
        this.isConnected = false;
    }
    getPool() {
        return this.pool;
    }
    getConnectionStatus() {
        return this.isConnected;
    }
}
exports.db = new Database();
exports.pool = exports.db.getPool();
exports.default = exports.pool;
