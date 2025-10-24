const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Create database file in the server directory
const dbPath = path.join(__dirname, 'study_buddy.db');
const db = new sqlite3.Database(dbPath);

console.log('🗄️  Initializing database...');

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create tables
const createTables = () => {
  return new Promise((resolve, reject) => {
    let tablesCreated = 0;
    const totalTables = 11; // Total number of tables to create
    
    const checkCompletion = () => {
      tablesCreated++;
      if (tablesCreated === totalTables) {
        resolve();
      }
    };

    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        university TEXT,
        major TEXT,
        year TEXT,
        bio TEXT,
        avatar TEXT,
        location TEXT,
        latitude REAL,
        longitude REAL,
        study_preferences TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ Users table created');
        checkCompletion();
      }
    });

    // User subjects table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        proficiency_level TEXT DEFAULT 'beginner',
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ User subjects table created');
        checkCompletion();
      }
    });

    // User study times table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_study_times (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        day_of_week TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ User study times table created');
        checkCompletion();
      }
    });

    // Matches table
    db.run(`
      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        user1_id TEXT NOT NULL,
        user2_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        matched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user1_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (user2_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ Matches table created');
        checkCompletion();
      }
    });

    // Chat conversations table
    db.run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user1_id TEXT NOT NULL,
        user2_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user1_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (user2_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ Conversations table created');
        checkCompletion();
      }
    });

    // Chat messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        content TEXT NOT NULL,
        message_type TEXT DEFAULT 'text',
        file_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        read_at DATETIME,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ Messages table created');
        checkCompletion();
      }
    });

    // Study sessions table
    db.run(`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        subject TEXT,
        session_type TEXT DEFAULT 'in-person',
        location TEXT,
        virtual_link TEXT,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        max_participants INTEGER DEFAULT 2,
        created_by TEXT NOT NULL,
        status TEXT DEFAULT 'scheduled',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ Study sessions table created');
        checkCompletion();
      }
    });

    // Session participants table
    db.run(`
      CREATE TABLE IF NOT EXISTS session_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        status TEXT DEFAULT 'confirmed',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES study_sessions (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ Session participants table created');
        checkCompletion();
      }
    });

    // Session ratings table
    db.run(`
      CREATE TABLE IF NOT EXISTS session_ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        rater_id TEXT NOT NULL,
        rated_user_id TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        feedback TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES study_sessions (id) ON DELETE CASCADE,
        FOREIGN KEY (rater_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (rated_user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ Session ratings table created');
        checkCompletion();
      }
    });

    // User preferences table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        preference_key TEXT NOT NULL,
        preference_value TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, preference_key)
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ User preferences table created');
        checkCompletion();
      }
    });

    // Notifications table
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        read BOOLEAN DEFAULT FALSE,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ Notifications table created');
        checkCompletion();
      }
    });

    // User likes table
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
      if (err) reject(err);
      else {
        console.log('✅ User likes table created');
        checkCompletion();
      }
    });
  });
};

// Insert sample data
const insertSampleData = async () => {
  try {
    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const sampleUsers = [
      {
        id: '1',
        email: 'emma@example.com',
        password: hashedPassword,
        name: 'Emma Thompson',
        university: 'UC Berkeley',
        major: 'Computer Science',
        year: 'Junior',
        bio: 'Passionate about algorithms and machine learning. Looking for study buddies for advanced CS courses!',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=150&h=150&fit=crop&crop=face',
        location: 'Berkeley, CA',
        latitude: 37.8716,
        longitude: -122.2727
      },
      {
        id: '2',
        email: 'marcus@example.com',
        password: hashedPassword,
        name: 'Marcus Johnson',
        university: 'UC Berkeley',
        major: 'Mathematics',
        year: 'Senior',
        bio: 'Math enthusiast who loves helping others understand complex concepts. Great at breaking down difficult problems.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        location: 'Berkeley, CA',
        latitude: 37.8716,
        longitude: -122.2727
      },
      {
        id: '3',
        email: 'sofia@example.com',
        password: hashedPassword,
        name: 'Sofia Rodriguez',
        university: 'UC Berkeley',
        major: 'Biology',
        year: 'Sophomore',
        bio: 'Pre-med student with a love for life sciences. Always excited to discuss biology and chemistry concepts!',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        location: 'Berkeley, CA',
        latitude: 37.8716,
        longitude: -122.2727
      }
    ];

    for (const user of sampleUsers) {
      db.run(`
        INSERT OR REPLACE INTO users (id, email, password, name, university, major, year, bio, avatar, location, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [user.id, user.email, user.password, user.name, user.university, user.major, user.year, user.bio, user.avatar, user.location, user.latitude, user.longitude]);
    }

    // Insert sample subjects
    const subjects = [
      ['1', 'Data Structures', 'intermediate'],
      ['1', 'Machine Learning', 'advanced'],
      ['1', 'Algorithms', 'intermediate'],
      ['2', 'Calculus', 'expert'],
      ['2', 'Linear Algebra', 'expert'],
      ['2', 'Statistics', 'advanced'],
      ['3', 'Biology', 'intermediate'],
      ['3', 'Chemistry', 'intermediate'],
      ['3', 'Physics', 'beginner']
    ];

    for (const [userId, subject, level] of subjects) {
      db.run(`
        INSERT OR REPLACE INTO user_subjects (user_id, subject, proficiency_level)
        VALUES (?, ?, ?)
      `, [userId, subject, level]);
    }

    // Insert sample study times
    const studyTimes = [
      ['1', 'Monday', '17:00', '20:00'],
      ['1', 'Tuesday', '17:00', '20:00'],
      ['1', 'Wednesday', '17:00', '20:00'],
      ['1', 'Thursday', '17:00', '20:00'],
      ['1', 'Friday', '17:00', '20:00'],
      ['1', 'Saturday', '20:00', '23:00'],
      ['1', 'Sunday', '20:00', '23:00'],
      ['2', 'Monday', '09:00', '12:00'],
      ['2', 'Tuesday', '09:00', '12:00'],
      ['2', 'Wednesday', '09:00', '12:00'],
      ['2', 'Thursday', '09:00', '12:00'],
      ['2', 'Friday', '09:00', '12:00'],
      ['2', 'Monday', '12:00', '17:00'],
      ['2', 'Tuesday', '12:00', '17:00'],
      ['2', 'Wednesday', '12:00', '17:00'],
      ['2', 'Thursday', '12:00', '17:00'],
      ['2', 'Friday', '12:00', '17:00'],
      ['3', 'Monday', '09:00', '12:00'],
      ['3', 'Tuesday', '09:00', '12:00'],
      ['3', 'Wednesday', '09:00', '12:00'],
      ['3', 'Thursday', '09:00', '12:00'],
      ['3', 'Friday', '09:00', '12:00'],
      ['3', 'Monday', '17:00', '20:00'],
      ['3', 'Tuesday', '17:00', '20:00'],
      ['3', 'Wednesday', '17:00', '20:00'],
      ['3', 'Thursday', '17:00', '20:00'],
      ['3', 'Friday', '17:00', '20:00']
    ];

    for (const [userId, day, start, end] of studyTimes) {
      db.run(`
        INSERT OR REPLACE INTO user_study_times (user_id, day_of_week, start_time, end_time)
        VALUES (?, ?, ?, ?)
      `, [userId, day, start, end]);
    }

    // Insert sample likes
    const likes = [
      ['1', '2'], // Emma likes Marcus
      ['1', '3'], // Emma likes Sofia
      ['2', '1'], // Marcus likes Emma
      ['3', '1'], // Sofia likes Emma
      ['2', '3']  // Marcus likes Sofia
    ];

    for (const [likerId, likedUserId] of likes) {
      const likeId = require('uuid').v4();
      db.run(`
        INSERT OR REPLACE INTO user_likes (id, liker_id, liked_user_id)
        VALUES (?, ?, ?)
      `, [likeId, likerId, likedUserId]);
    }

    console.log('✅ Sample data inserted');
  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  }
};

// Create indexes for better performance
const createIndexes = () => {
  return new Promise((resolve, reject) => {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_location ON users(location)',
      'CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user1_id, user2_id)',
      'CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_created_by ON study_sessions(created_by)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON study_sessions(start_time)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)'
    ];

    let indexesCreated = 0;
    const totalIndexes = indexes.length;

    const checkIndexCompletion = () => {
      indexesCreated++;
      if (indexesCreated === totalIndexes) {
        console.log('✅ Database indexes created');
        resolve();
      }
    };

    indexes.forEach(index => {
      db.run(index, (err) => {
        if (err) {
          console.warn('⚠️  Warning creating index:', err.message);
        }
        checkIndexCompletion();
      });
    });
  });
};

// Main initialization
const initializeDatabase = async () => {
  try {
    await createTables();
    await insertSampleData();
    await createIndexes();
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('📊 Database file created at:', dbPath);
    
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err);
      } else {
        console.log('🔒 Database connection closed');
      }
    });
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    db.close();
  }
};

// Run initialization
initializeDatabase();
