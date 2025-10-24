const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Create database file in the server directory
const dbPath = path.join(__dirname, 'database', 'study_buddy.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Repairing database...');

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create user_likes table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS user_likes (
    id TEXT PRIMARY KEY,
    liker_id TEXT NOT NULL,
    liked_user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (liker_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (liked_user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(liker_id, liked_user_id)
  )
`, (err) => {
  if (err) {
    console.error('❌ Error creating user_likes table:', err);
  } else {
    console.log('✅ user_likes table created/verified');
  }

  // Check if table has any data
  db.get("SELECT COUNT(*) as count FROM user_likes", (err, result) => {
    if (err) {
      console.log('❌ Cannot count rows in user_likes:', err.message);
    } else {
      console.log(`📈 user_likes table has ${result.count} rows`);
      
      // If no data, insert sample likes
      if (result.count === 0) {
        console.log('📝 Inserting sample likes...');
        
        const sampleLikes = [
          ['1', '2'], // Emma likes Marcus
          ['1', '3'], // Emma likes Sofia
          ['2', '1'], // Marcus likes Emma
          ['3', '1'], // Sofia likes Emma
          ['2', '3']  // Marcus likes Sofia
        ];

        let likesInserted = 0;
        const totalLikes = sampleLikes.length;

        sampleLikes.forEach(([likerId, likedUserId]) => {
          const likeId = uuidv4();
          db.run(`
            INSERT INTO user_likes (id, liker_id, liked_user_id)
            VALUES (?, ?, ?)
          `, [likeId, likerId, likedUserId], (err) => {
            if (err) {
              console.error('❌ Error inserting like:', err);
            } else {
              likesInserted++;
              if (likesInserted === totalLikes) {
                console.log('✅ Sample likes inserted successfully');
                
                // Close database
                db.close((err) => {
                  if (err) {
                    console.error('❌ Error closing database:', err);
                  } else {
                    console.log('🔒 Database connection closed');
                    console.log('🎉 Database repair completed!');
                  }
                });
              }
            }
          });
        });
      } else {
        // Close database if no repair needed
        db.close((err) => {
          if (err) {
            console.error('❌ Error closing database:', err);
          } else {
            console.log('🔒 Database connection closed');
            console.log('✅ Database is already properly set up!');
          }
        });
      }
    }
  });
});
