import express from 'express';
import User from '../models/user.model.js'; 
import {registerValidation, loginValidation} from '../validation.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const router = express.Router();

const users= [];
// REGISTER
router.post('/register', async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  // check if user already exist
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).json({ error: 'Email already exists' });

  try{
  // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // create new user
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    const savedUser= await user.save();

    const token = jwt.sign({_id: savedUser._id}, process.env.TOKEN_SECRET, {expiresIn : '1h'});
    res.status(200).json({ token });

  } catch (err) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  // Validate request body
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Email not found' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Create token
    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      process.env.TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;