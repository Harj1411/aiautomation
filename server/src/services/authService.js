const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { isMongo, inMemoryStore } = require('../config/db');
const User = require('../models/User');

const registerUser = async ({ name, email, password, role }) => {
  const existingEmail = email.toLowerCase().trim();

  let existing = null;
  if (isMongo()) {
    existing = await User.findOne({ email: existingEmail });
  } else {
    existing = inMemoryStore.users.find((u) => u.email === existingEmail);
  }

  if (existing) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const userRole = role || 'operator';

  let userObj = null;
  if (isMongo()) {
    const newUser = new User({
      name,
      email: existingEmail,
      password: hashedPassword,
      role: userRole
    });
    await newUser.save();
    userObj = newUser.toObject();
  } else {
    userObj = {
      _id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      email: existingEmail,
      password: hashedPassword,
      role: userRole,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryStore.users.push(userObj);
  }

  delete userObj.password;
  const token = jwt.sign({ id: userObj._id, email: userObj.email, role: userObj.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

  return { user: userObj, token };
};

const loginUser = async ({ email, password }) => {
  const cleanEmail = email.toLowerCase().trim();

  let user = null;
  if (isMongo()) {
    user = await User.findOne({ email: cleanEmail }).select('+password');
  } else {
    user = inMemoryStore.users.find((u) => u.email === cleanEmail);
  }

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Update lastLogin
  if (isMongo()) {
    user.lastLogin = new Date();
    await user.save();
    user = user.toObject();
  } else {
    user.lastLogin = new Date();
  }

  const userObj = { ...user };
  delete userObj.password;

  const token = jwt.sign({ id: userObj._id, email: userObj.email, role: userObj.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

  return { user: userObj, token };
};

const getUserById = async (userId) => {
  let user = null;
  if (isMongo()) {
    user = await User.findById(userId);
  } else {
    user = inMemoryStore.users.find((u) => String(u._id) === String(userId));
  }

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const userObj = isMongo() ? user.toObject() : { ...user };
  delete userObj.password;
  return userObj;
};

module.exports = {
  registerUser,
  loginUser,
  getUserById
};
