require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('./models/Item');
const Person = require('./models/Person');
const User = require('./models/User');

// Connect to MongoDB using the same configuration as the application
const MONGODB_URI = 'mongodb://localhost:27017/dlsl-lfims'; // Use local MongoDB

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  dbName: 'dlsl-lfims'
})
  .then(() => {
    console.log('Connected to MongoDB');
    cleanDatabase();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

async function cleanDatabase() {
  try {
    // Delete all items
    const itemsResult = await Item.deleteMany({});
    console.log(`Deleted ${itemsResult.deletedCount} items`);
    
    // Delete all persons
    const personsResult = await Person.deleteMany({});
    console.log(`Deleted ${personsResult.deletedCount} persons`);
    
    console.log('Database cleaned successfully!');
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

const fixUsers = async () => {
  try {
    // Find and remove any 'admin' user
    const adminUser = await User.findOne({ username: 'admin' });
    if (adminUser) {
      console.log('Removing old admin user');
      await User.deleteOne({ _id: adminUser._id });
    }

    // Check if superadmin exists
    let superAdminUser = await User.findOne({ username: 'superadmin' });
    
    if (superAdminUser) {
      console.log('Updating superadmin user');
      superAdminUser.password = '12345678';
      await superAdminUser.save();
    } else {
      // Create new superadmin user
      console.log('Creating new superadmin user');
      superAdminUser = new User({
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: '12345678',
        name: 'Super Admin',
        role: 'superAdmin',
        createdAt: new Date()
      });
      
      await superAdminUser.save();
    }
    
    console.log('User database fix completed');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing users:', error);
    process.exit(1);
  }
};

fixUsers(); 