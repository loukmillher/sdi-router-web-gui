const sequelize = require('./index');
const fs = require('fs').promises;
const path = require('path');

class MigrationRunner {
  constructor() {
    this.migrationTableName = 'migrations';
  }

  async ensureMigrationTable() {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS ${this.migrationTableName} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getExecutedMigrations() {
    const [results] = await sequelize.query(
      `SELECT name FROM ${this.migrationTableName} ORDER BY name`
    );
    return results.map(r => r.name);
  }

  async getMigrationFiles() {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    return files
      .filter(f => f.endsWith('.js'))
      .sort();
  }

  async runMigration(filename) {
    const migrationPath = path.join(__dirname, 'migrations', filename);
    const migration = require(migrationPath);
    
    const transaction = await sequelize.transaction();
    
    try {
      console.log(`Running migration: ${filename}`);
      await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
      
      await sequelize.query(
        `INSERT INTO ${this.migrationTableName} (name) VALUES (?)`,
        {
          replacements: [filename],
          transaction
        }
      );
      
      await transaction.commit();
      console.log(`Migration completed: ${filename}`);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async run() {
    try {
      await this.ensureMigrationTable();
      
      const executed = await this.getExecutedMigrations();
      const files = await this.getMigrationFiles();
      
      const pending = files.filter(f => !executed.includes(f));
      
      if (pending.length === 0) {
        console.log('No pending migrations');
        return;
      }
      
      console.log(`Found ${pending.length} pending migrations`);
      
      for (const migration of pending) {
        await this.runMigration(migration);
      }
      
      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  const runner = new MigrationRunner();
  runner.run().then(() => {
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}

module.exports = MigrationRunner;