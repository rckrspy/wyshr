import { Pool, PoolConfig } from 'pg';
import { config } from '../config/config';

interface DatabaseConfig extends PoolConfig {
  connectionString?: string;
}

class Database {
  private pool: Pool;
  private isConnected: boolean = false;

  constructor() {
    const dbConfig: DatabaseConfig = {
      connectionString: config.db.url,
      ssl: false, // Disable SSL for local Docker containers
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(dbConfig);

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.isConnected = true;
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (config.env === 'development') {
        console.log('Query executed', { text, duration, rows: result.rowCount });
      }
      
      return result.rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async transaction<T = unknown>(
    callback: (client: import('pg').PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    try {
      const result = await this.query<{ now: Date }>('SELECT NOW() as now');
      return {
        status: 'healthy',
        timestamp: result[0].now,
      };
    } catch {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
      };
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    this.isConnected = false;
  }

  getPool(): Pool {
    return this.pool;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const db = new Database();
export const pool = db.getPool();
export default pool;