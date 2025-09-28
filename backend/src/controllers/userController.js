import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const JWT_SECRET = process.env.JWT_SECRET || 'qwertyuiopasdfghhjklzxcvbnm';

export async function signup(req, res) {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Username or email already taken' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      role,
      created_at: new Date()
    });

    await newUser.save();

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}


export async function signin(req, res) {
  try {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      return res.status(400).json({ success: false, message: 'Provide username/email and password' });
    }

    const user = await User.findOne({
      $or: [
        username ? { username } : null,
        email ? { email } : null,
      ].filter(Boolean)
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({ 
      success: true, 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export function logout(req, res) {
  res.cookie('token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: new Date(0),
  });

  return res.json({ success: true });
}

export async function getUserInfo(req, res) {
  try {
    const { id } = req.params;

    if (req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const user = await User.findOne({ id });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { username, email, role } = user;

    return res.json({ username, email, role });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
