const mongoose = require('mongoose');
const env = require('./env');

let isConnectedToMongo = false;

// In-Memory Database Fallback Store
const inMemoryStore = {
  users: [],
  workflows: [],
  executions: [],
  executionLogs: [],
  integrations: [],
  notifications: [],
  agentMemory: []
};

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    isConnectedToMongo = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    isConnectedToMongo = false;
    console.log(`[Database] MongoDB connection failed (${err.message}). Using In-Memory Storage Fallback.`);
  }
};

const isMongo = () => isConnectedToMongo;

module.exports = {
  connectDB,
  isMongo,
  inMemoryStore
};
