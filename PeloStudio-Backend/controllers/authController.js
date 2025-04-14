// controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Sign up a new user
exports.signup = async (req, res) => {
  try {
    const { email, telephone, password, firstName, lastName, dateOfBirth, gender } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: {
        telephone
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const newUser = await User.create({
      email,
      telephone,
      password_hash: hashedPassword,
      role: 'customer',
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      gender
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Return user info without password
    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      telephone: newUser.telephone,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      role: newUser.role,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    const { email, telephone, password } = req.body;
    
    // Find user by email or telephone
    let whereClause = {};
    if (email) {
      whereClause.email = email;
    } else if (telephone) {
      whereClause.telephone = telephone;
    } else {
      return res.status(400).json({ message: 'Email or telephone is required' });
    }
    
    const user = await User.findOne({ where: whereClause });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Return user info without password
    res.status(200).json({
      id: user.id,
      email: user.email,
      telephone: user.telephone,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      id: user.id,
      email: user.email,
      telephone: user.telephone,
      firstName: user.first_name,
      lastName: user.last_name,
      dateOfBirth: user.date_of_birth,
      gender: user.gender,
      photoUrl: user.photo_url,
      role: user.role
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, email } = req.body;
    
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (firstName) user.first_name = firstName;
    if (lastName) user.last_name = lastName;
    if (dateOfBirth) user.date_of_birth = dateOfBirth;
    if (gender) user.gender = gender;
    if (email) user.email = email;
    
    await user.save();
    
    // Return updated user
    res.status(200).json({
      id: user.id,
      email: user.email,
      telephone: user.telephone,
      firstName: user.first_name,
      lastName: user.last_name,
      dateOfBirth: user.date_of_birth,
      gender: user.gender,
      photoUrl: user.photo_url,
      role: user.role
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};