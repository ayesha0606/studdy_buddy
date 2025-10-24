const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in the server directory
const dbPath = path.join(__dirname, 'database', 'study_buddy.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking database schema...');

// Check if user_likes table exists
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('❌ Error checking tables:', err);
  } else {
    console.log('📋 Available tables:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });
  }

  // Check user_likes table structure if it exists
  db.all("PRAGMA table_info(user_likes)", (err, columns) => {
    if (err) {
      console.log('❌ user_likes table does not exist or error:', err.message);
    } else {
      console.log('\n📊 user_likes table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
    }

    // Check if there are any rows in user_likes
    db.get("SELECT COUNT(*) as count FROM user_likes", (err, result) => {
      if (err) {
        console.log('❌ Cannot count rows in user_likes:', err.message);
      } else {
        console.log(`\n📈 user_likes table has ${result.count} rows`);
      }

      // Close database
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err);
        } else {
          console.log('🔒 Database connection closed');
        }
      });
    });
  });
});
