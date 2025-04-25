const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Explicitly set the MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/dlsl-lfims';

async function fixUsers() {
  try {
    // Connect directly to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');

    // Delete admin user if it exists
    console.log('Checking for admin user...');
    const adminDeleted = await User.deleteOne({ username: 'admin' });
    console.log(`Admin user deleted: ${adminDeleted.deletedCount > 0 ? 'Yes' : 'No'}`);

    // Check for superadmin user
    console.log('Checking for superadmin user...');
    const superadminExists = await User.findOne({ username: 'superadmin' });

    if (superadminExists) {
      console.log('Superadmin user exists, resetting password');
      const updatedUser = await User.forceResetUser('superadmin', '12345678');
      console.log('Password reset result:', updatedUser ? 'Success' : 'Failed');
    } else {
      // Create new superadmin user
      console.log('Creating new superadmin user');
      const salt = await require('bcryptjs').genSalt(10);
      const hashedPassword = await require('bcryptjs').hash('12345678', salt);
      
      const newSuperAdmin = new User({
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: hashedPassword, // Use pre-hashed password to bypass middleware
        name: 'Super Admin',
        role: 'superAdmin',
        createdAt: new Date()
      });
      
      await newSuperAdmin.save();
      console.log('Superadmin user created successfully');
    }

    // Verify the user exists with correct role
    const finalCheck = await User.findOne({ username: 'superadmin' });
    console.log('Final check - Superadmin exists:', !!finalCheck);
    console.log('Username:', finalCheck?.username);
    console.log('Role:', finalCheck?.role);
    
    console.log('User fix completed successfully');
  } catch (error) {
    console.error('Error fixing users:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

// Run the fix
fixUsers(); 