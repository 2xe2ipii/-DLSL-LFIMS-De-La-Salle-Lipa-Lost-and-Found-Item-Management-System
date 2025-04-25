const mongoose = require('mongoose');
const Item = require('./models/Item');
require('dotenv').config();

const clearDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      dbName: 'dlsl-lfims'
    });

    console.log('Connected to MongoDB');

    // Delete all items
    const result = await Item.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} items from the database.`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase(); 