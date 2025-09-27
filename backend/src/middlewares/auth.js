import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'qwertyuiopasdfghhjklzxcvbnm';

export function authenticate(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}