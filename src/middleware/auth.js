const db = require('../db');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'Missing or invalid Authorization header. Use Bearer <token>.',
    });
  }

  const session = db.sessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  const user = db.findUserById(session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found for this token.' });
  }

  req.user = { id: user.id, name: user.name, email: user.email };
  next();
}

module.exports = { authenticate };
