const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

let gridFSBucket;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Initialize GridFS bucket
    gridFSBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: 'uploads'
    });
    
  } catch (error) {
    console.warn(`Local MongoDB connection failed (${error.message}). Attempting in-memory MongoDB fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✓ In-Memory MongoDB Started & Connected: ${uri}`);
      
      gridFSBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
        bucketName: 'uploads'
      });
      
      // Auto seed initial data
      const seed = require('../utils/seedData');
      await seed();
    } catch (fallbackError) {
      console.error(`Error with in-memory MongoDB fallback: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

const getGridFSBucket = () => {
  if (!gridFSBucket) {
    throw new Error('GridFSBucket has not been initialized. Please connect to MongoDB first.');
  }
  return gridFSBucket;
};

module.exports = { connectDB, getGridFSBucket };
