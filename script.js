// Login
const response = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important! Includes cookies
  body: JSON.stringify({ email, password })
});

// Check if logged in
const user = await fetch('/api/me', {
  credentials: 'include'
});