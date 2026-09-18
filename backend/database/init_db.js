const bcrypt = require('bcryptjs');
const { query, getDbType } = require('./db');

async function initDatabase() {
  console.log(`🌸 Initializing Database (${getDbType()})...`);

  try {
    // 1. Create Users Table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id ${getDbType() === 'sqlite' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'couple',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Password-recovery tokens are stored hashed, so a database leak cannot be
    // used to reset an account. This table is also created for existing installs.
    await query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id ${getDbType() === 'sqlite' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        user_id ${getDbType() === 'sqlite' ? 'INTEGER' : 'INT'} NOT NULL,
        token_hash VARCHAR(64) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        used_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 2. Create Settings Table
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        id ${getDbType() === 'sqlite' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        my_name VARCHAR(50) DEFAULT 'Nihar',
        gf_name VARCHAR(50) DEFAULT 'Isha',
        relationship_start_date DATE DEFAULT '2026-06-23',
        anniversary_date DATE DEFAULT '2026-06-23',
        secret_pin_hash VARCHAR(255) NOT NULL,
        app_title VARCHAR(100) DEFAULT 'Infinity ❤️',
        my_avatar VARCHAR(255) DEFAULT '',
        gf_avatar VARCHAR(255) DEFAULT '',
        hero_background_filename VARCHAR(255) DEFAULT '',
        hero_background_scale INT DEFAULT 100,
        hero_background_x INT DEFAULT 50,
        hero_background_y INT DEFAULT 50,
        bg_music_url VARCHAR(500) DEFAULT '',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migration for databases created before the dashboard background setting.
    try {
      await query('ALTER TABLE settings ADD COLUMN hero_background_filename VARCHAR(255) DEFAULT \'\'');
    } catch (err) {
      const duplicateColumn = /duplicate column|already exists/i.test(err.message);
      if (!duplicateColumn) throw err;
    }
    for (const column of [
      'hero_background_scale INT DEFAULT 100',
      'hero_background_x INT DEFAULT 50',
      'hero_background_y INT DEFAULT 50'
    ]) {
      try {
        await query(`ALTER TABLE settings ADD COLUMN ${column}`);
      } catch (err) {
        if (!/duplicate column|already exists/i.test(err.message)) throw err;
      }
    }

    // 3. Create Memories Table
    await query(`
      CREATE TABLE IF NOT EXISTS memories (
        id ${getDbType() === 'sqlite' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        title VARCHAR(150),
        caption TEXT,
        memory_date DATE NOT NULL,
        image_filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255),
        mime_type VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create Love Notes Table
    await query(`
      CREATE TABLE IF NOT EXISTS love_notes (
        id ${getDbType() === 'sqlite' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        title VARCHAR(150) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        note_date DATE NOT NULL,
        is_bookmarked TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Create Our Story Table
    await query(`
      CREATE TABLE IF NOT EXISTS our_story (
        id ${getDbType() === 'sqlite' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        title VARCHAR(150) NOT NULL,
        subtitle VARCHAR(200),
        content TEXT NOT NULL,
        stage_type VARCHAR(50) NOT NULL,
        event_date DATE NOT NULL,
        image_filename VARCHAR(255) DEFAULT '',
        order_index INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Create Visual Timeline Events Table
    await query(`
      CREATE TABLE IF NOT EXISTS timeline_events (
        id ${getDbType() === 'sqlite' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        title VARCHAR(150) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        image_filename VARCHAR(255) DEFAULT '',
        icon VARCHAR(50) DEFAULT 'heart',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Create Special Events / Countdowns Table
    await query(`
      CREATE TABLE IF NOT EXISTS special_events (
        id ${getDbType() === 'sqlite' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        title VARCHAR(150) NOT NULL,
        event_date DATE NOT NULL,
        event_type VARCHAR(50) DEFAULT 'custom',
        icon VARCHAR(50) DEFAULT 'heart',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Create Secret Notes Table
    await query(`
      CREATE TABLE IF NOT EXISTS secret_notes (
        id ${getDbType() === 'sqlite' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        title VARCHAR(150) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'secret_note',
        target_date DATE NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tables checked and verified.');

    // Seed default user if none exists
    const users = await query('SELECT * FROM users LIMIT 1');
    if (users.length === 0) {
      const defaultPassword = process.env.DEFAULT_PASSWORD || 'love1234';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      await query(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['couple', 'us@ourlittleworld.love', passwordHash, 'couple']
      );
      console.log(`👤 Seeded default couple user (Username: "couple", Password: "${defaultPassword}")`);
    }

    // Seed default settings if none exist
    const settings = await query('SELECT * FROM settings LIMIT 1');
    if (settings.length === 0) {
      const defaultPin = process.env.SECRET_PIN || '1234';
      const pinHash = await bcrypt.hash(defaultPin, 10);
      const myName = process.env.MY_NAME || 'Nihar';
      const gfName = process.env.GF_NAME || 'Isha';
      const startDate = process.env.RELATIONSHIP_START_DATE || '2026-06-23';
      const anniversary = process.env.ANNIVERSARY_DATE || '2026-06-23';

      await query(
        `INSERT INTO settings (my_name, gf_name, relationship_start_date, anniversary_date, secret_pin_hash, app_title) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [myName, gfName, startDate, anniversary, pinHash, 'Infinity ❤️']
      );
      console.log('⚙️ Seeded default couple settings.');
    }

    // Seed initial Our Story entries if empty
    const storyCount = await query('SELECT COUNT(*) as cnt FROM our_story');
    const cnt = storyCount[0]?.cnt || 0;
    if (cnt === 0) {
      await query(
        `INSERT INTO our_story (title, subtitle, content, stage_type, event_date, order_index) VALUES 
        ('How It Started 💕', 'The day we first met...', 'A rainy afternoon that changed everything. We sat by the window, talking for hours until time lost all meaning.', 'how_it_started', '2023-02-14', 1),
        ('First Conversation 💬', 'That conversation I will never forget', 'Late night text messages that turned into sunrise phone calls. We realized how deeply we understood each other.', 'first_conversation', '2023-02-20', 2),
        ('First Date 🌸', 'One of my favorite days', 'Walked through the botanic garden holding hands for the very first time. Your smile lit up the entire day.', 'first_date', '2023-03-05', 3),
        ('Favorite Memory 📸', 'A moment I wish I could replay forever', 'Sitting under the starry night sky listening to the ocean waves, holding you close in the cool breeze.', 'favorite_memory', '2023-07-20', 4),
        ('Today ❤️', 'And we are still creating memories', 'Every single day with you is a gift. I fall in love with you more and more every morning.', 'today', '2026-01-01', 5)`
      );
      console.log('💌 Seeded default story narrative.');
    }

    // Seed initial Love Notes if empty
    const notesCount = await query('SELECT COUNT(*) as cnt FROM love_notes');
    if ((notesCount[0]?.cnt || 0) === 0) {
      await query(
        `INSERT INTO love_notes (title, content, category, note_date, is_bookmarked) VALUES
        ('Why I Love You ❤️', 'I love the gentle way you laugh when you try to stay serious, how soft your voice gets when you are sleepy, and how you make every place feel like home.', 'Why I Love You', '2023-04-10', 1),
        ('Open When You Miss Me 💌', 'If you are reading this right now, take a deep breath and close your eyes. I am sending you the warmest hug. No distance can change how close you are to my heart.', 'Open When...', '2023-05-15', 1),
        ('Things I Want To Do With You 🌎', 'Watch a sunrise on a quiet beach, build a cozy fort in the living room on a rainy Sunday, and travel across the world holding your hand.', 'Future', '2023-09-01', 0),
        ('Random Thought About You 🥰', 'Just realized how lucky I am. Out of 8 billion people on this planet, I got to find you.', 'Random Thought', '2024-01-12', 0)`
      );
      console.log('💌 Seeded default love notes.');
    }

    // Seed initial special events if empty
    const eventsCount = await query('SELECT COUNT(*) as cnt FROM special_events');
    if ((eventsCount[0]?.cnt || 0) === 0) {
      await query(
        `INSERT INTO special_events (title, event_date, event_type, icon, notes) VALUES
        ('Next Anniversary ❤️', '2027-02-14', 'anniversary', 'heart', 'Celebrating our special day!'),
        ('Her Birthday 🎂', '2026-11-20', 'birthday', 'cake', 'Surprise gifts & dinner planned!'),
        ('First Met Anniversary 🌸', '2026-02-14', 'first_meeting', 'sparkles', 'The day our world began.')`
      );
      console.log('🎉 Seeded default countdown events.');
    }

    // Seed secret notes if empty
    const secretCount = await query('SELECT COUNT(*) as cnt FROM secret_notes');
    if ((secretCount[0]?.cnt || 0) === 0) {
      await query(
        `INSERT INTO secret_notes (title, content, category, target_date) VALUES
        ('Our Dream Trip ✈️', 'Stay in an overwater bungalow in Maldives, sip morning coffee on the terrace, and swim in turquoise waters together.', 'future_plan', '2027-06-01'),
        ('Couple Bucket List 📝', '1. Go stargazing in the mountains\n2. Take a pottery class together\n3. Write letters to open 5 years from now\n4. Bake a cake from scratch', 'bucket_list', NULL),
        ('Private Message 🔒', 'You are my favorite thought every morning and my last peace before sleep. Thank you for being my sanctuary.', 'private_message', NULL)`
      );
      console.log('🔐 Seeded default secret corner items.');
    }

    console.log('✨ Database initialization finished successfully.');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    throw err;
  }
}

module.exports = { initDatabase };
