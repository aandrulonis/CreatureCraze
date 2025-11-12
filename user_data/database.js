import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function createTables() {
  // Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      animalType VARCHAR(255) NOT NULL,
      level INTEGER DEFAULT 0,
      dollars NUMERIC DEFAULT 0.0,
      TOKENS INTEGER DEFAULT 0,
      animal_id INTEGER REFERENCES animals(id) ON DELETE SET NULL,
      little_buddies_ids INTEGER[],
      tops TEXT[],
      bottoms TEXT[],
      shoes TEXT[],
      hats TEXT[],
      glasses TEXT[],
      accessories TEXT[],
      dance_moves TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create animals table
  await sql`
    CREATE TABLE IF NOT EXISTS animals (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      curr_top TEXT,
      curr_bottom TEXT,
      curr_shoes TEXT,
      curr_hat TEXT,
      curr_glasses TEXT,
      curr_accessories TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create little buddies table
  await sql`
    CREATE TABLE IF NOT EXISTS little_buddies (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      color INTEGER NOT NULL,
      accessories TEXT[],
      type TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('Tables created successfully');
}

async function addUser(user, animal) {
  try {
    const [animalEntry] = await sql`
      INSERT INTO animals (type)
      VALUES (${animal.animalType})
      RETURNING *
    `;
    const [userEntry] = await sql`
      INSERT INTO users (email, username, password, animal_id)
      VALUES (
        ${user.email}, 
        ${user.username}, 
        ${user.password}, 
        ${animalEntry.id}
      )
      RETURNING *
    `;
    user.id = userEntry.id;
    animal.id = animalEntry.id;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
}

async function checkNameEmailAvailable(email, username) {
  const existing = await sql`
    SELECT id, email, username 
    FROM users 
    WHERE email = ${email} OR username = ${username}
  `;
  return existing.length == 0;
}


async function resetPassword(user, newPassword) {
  try {
    await sql`
      UPDATE users 
      SET password = ${newPassword}
      WHERE id = ${user.id}
    `;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

async function addLittleBuddy(user, littleBuddy) {
  try {
    const [littleBuddyEntry] = await sql`
      INSERT INTO little_buddies (name, color, type)
      VALUES (${littleBuddy.name}, ${littleBuddy.color}, ${littleBuddy.buddyType})
      RETURNING *
    `;

    // Add ID to array
    await sql`
      UPDATE users 
      SET little_buddies_ids = array_append(little_buddies_ids, ${littleBuddyEntry.id})
      WHERE id = ${user.id}
    `;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
}

async function addTop(user, top) {
  try {
    await sql`
      UPDATE users 
      SET tops = array_append(tops, ${top})
      WHERE id = ${user.id}
    `;
  } catch (error) {
    console.error('Error adding top:', error);
    throw error;
  }
}


async function addBottom(user, bottom) {
  try {
    await sql`
      UPDATE users 
      SET bottoms = array_append(bottoms, ${bottom})
      WHERE id = ${user.id}
    `;
  } catch (error) {
    console.error('Error adding bottom:', error);
    throw error;
  }
}

async function addShoes(user, shoes) {
  try {
    await sql`
      UPDATE users 
      SET shoes = array_append(shoes, ${shoes})
      WHERE id = ${user.id}
    `;
  } catch (error) {
    console.error('Error adding shoes:', error);
    throw error;
  }
}

async function addHat(user, hat) {
  try {
    await sql`
      UPDATE users 
      SET hats = array_append(hats, ${hat})
      WHERE id = ${user.id}
    `;
  } catch (error) {
    console.error('Error adding hat:', error);
    throw error;
  }
}

async function addGlasses(user, glasses) {
  try {
    await sql`
      UPDATE users 
      SET glasses = array_append(glasses, ${glasses})
      WHERE id = ${user.id}
    `;
  } catch (error) {
    console.error('Error adding glasses:', error);
    throw error;
  }
}

async function addAccessory(user, accessory) {
  try {
    await sql`
      UPDATE users 
      SET accessories = array_append(accessories, ${accessory})
      WHERE id = ${user.id}
    `;
  } catch (error) {
    console.error('Error adding accessory:', error);
    throw error;
  }
}

async function updateClothing(animal) {
  try {
    await sql`
      UPDATE animals 
      SET 
        curr_top = ${animal.currTop}, 
        curr_bottom = ${animal.currBottom},
        curr_hat = ${animal.currHat},
        curr_shoes = ${animal.currShoes},
        curr_accessories = ${animal.currAccessories}
      WHERE id = ${animal.id}
    `;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

async function checkPassword(email, password) {
  const [entry] = await sql`
    SELECT password
    FROM users 
    WHERE email = ${email}
    LIMIT 1
  `;
  if (!entry) {
    return false;
  }
  return entry.password === password;
}

async function loadUser(email) {
  try {
    // Get user with animal in one query
    const [userData] = await sql`
      SELECT 
        u.*,
        a.id as animal_id,
        a.type as animal_type,
        a.curr_top,
        a.curr_bottom,
        a.curr_shoes,
        a.curr_hat,
        a.curr_glasses,
        a.curr_accessories
      FROM users u
      LEFT JOIN animals a ON u.animal_id = a.id
      WHERE u.email = ${email}
      LIMIT 1
    `;
    
    if (!userData) {
      return null;
    }

    // Get little buddies
    let littleBuddies = [];
    if (userData.little_buddies_ids && userData.little_buddies_ids.length > 0) {
      const buddiesData = await sql`
        SELECT * FROM little_buddies 
        WHERE id = ANY(${userData.little_buddies_ids})
      `;
      
      littleBuddies = buddiesData.map(buddy => new LittleBuddy(
        buddy.type,
        buddy.color,
        buddy.accessories || [],
        buddy.name));
    }

    // Build animal object if exists
    const animal = userData.animal_id ? new Animal (
      userData.animal_id,
      userData.animal_type,
      userData.curr_top,
      userData.curr_bottom,
      userData.curr_shoes,
      userData.curr_hat,
      userData.curr_glasses
     ) : null;

    return new User (
      userData.id,
      userData.email,
      userData.username,
      userData.password,
      userData.dollars,
      littleBuddies,
      animal,
      userData.tops || [],
      userData.bottoms || [],
      userData.shoes || [],
      userData.hats || [],
      userData.glasses || [],
      userData.accessories || [],
      userData.dance_moves || [],
      userData.level
    );

  } catch (error) {
    console.error('Error loading user:', error);
    throw error;
  }
}

export {
  createTables,
  addUser,
  checkNameEmailAvailable,
  checkPassword,
  resetPassword,
  addLittleBuddy,
  addTop,
  addBottom,
  addShoes,
  addHat,
  addGlasses,
  addAccessory,
  updateClothing,
  loadUser
};