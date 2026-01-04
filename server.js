import express from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import { checkPassword, loadUser, addUser, checkNameEmailAvailable } from 'user_data/database.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// In-memory session store (use Redis in production)
const sessions = new Map();

// Generate secure session ID
function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

// Session middleware
async function requireAuth(req, res, next) {
  const sessionId = req.cookies.sessionId;
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const session = sessions.get(sessionId);
  
  // Check if session expired (24 hours)
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    sessions.delete(sessionId);
    res.clearCookie('sessionId');
    return res.status(401).json({ error: 'Session expired' });
  }
  
  req.user = session.user;
  next();
}

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, username, password, animalType } = req.body;
    
    // Validate input
    if (!email || !username || !password || !animalType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if email/username available
    const available = await checkNameEmailAvailable(email, username);
    if (!available) {
      return res.status(409).json({ error: 'Email or username already exists' });
    }
    
    // Create user
    const user = { email, username, password };
    const animal = { animalType };
    await addUser(user, animal);
    
    // Load complete user data
    const fullUser = await loadUser(email);
    
    // Create session
    const sessionId = generateSessionId();
    sessions.set(sessionId, {
      user: fullUser,
      createdAt: Date.now()
    });
    
    // Set cookie (httpOnly for security)
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({ 
      success: true, 
      user: {
        id: fullUser.id,
        email: fullUser.email,
        username: fullUser.username
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Verify credentials
    const isValid = await checkPassword(email, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Load user data
    const user = await loadUser(email);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Create session
    const sessionId = generateSessionId();
    sessions.set(sessionId, {
      user: user,
      createdAt: Date.now()
    });
    
    // Set cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/logout', (req, res) => {
  const sessionId = req.cookies.sessionId;
  
  if (sessionId) {
    sessions.delete(sessionId);
  }
  
  res.clearCookie('sessionId');
  res.json({ success: true });
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Protected route example
app.get('/api/profile', requireAuth, (req, res) => {
  res.json({ 
    user: {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      level: req.user.level,
      dollars: req.user.dollars
    }
  });
});

// Session cleanup (run periodically)
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.createdAt > 24 * 60 * 60 * 1000) {
      sessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});