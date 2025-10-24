const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'study_buddy.db');
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Error connecting to database:', err);
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          // Enable foreign keys
          this.db.run('PRAGMA foreign_keys = ON');
          resolve();
        }
      });
    });
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('❌ Error closing database:', err);
            reject(err);
          } else {
            console.log('🔒 Database connection closed');
            this.db = null;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // Execute a query with parameters
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            changes: this.changes
          });
        }
      });
    });
  }

  // Get a single row
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get multiple rows
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Execute multiple statements in a transaction
  transaction(statements) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        let completed = 0;
        let hasError = false;

        statements.forEach(({ sql, params = [] }, index) => {
          this.db.run(sql, params, function(err) {
            if (err && !hasError) {
              hasError = true;
              this.db.run('ROLLBACK');
              reject(err);
            } else {
              completed++;
              if (completed === statements.length && !hasError) {
                this.db.run('COMMIT', (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve();
                  }
                });
              }
            }
          });
        });
      });
    });
  }

  // Check if database is connected
  isConnected() {
    return this.db !== null;
  }
}

// Create a singleton instance
const database = new Database();

module.exports = database;
