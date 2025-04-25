const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const createAdmin = async () => {
  try {
    // Check if old admin user exists (from previous version)
    const oldAdmin = await User.findOne({ 
      $or: [
        { username: 'admin' },
        { email: 'admin@example.com' }
      ]
    });
    
    // If old admin exists, remove it
    if (oldAdmin) {
      console.log('Removing old admin user');
      await User.deleteOne({ _id: oldAdmin._id });
    }
    
    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ 
      $or: [
        { username: 'superadmin' },
        { email: 'superadmin@example.com' }
      ]
    });
    
    if (existingSuperAdmin) {
      console.log('Superadmin user already exists, updating credentials');
      existingSuperAdmin.password = '12345678';
      await existingSuperAdmin.save();
      console.log('Superadmin password updated');
      process.exit(0);
    }
    
    // Create new superadmin user
    const adminUser = new User({
      username: 'superadmin',
      email: 'superadmin@example.com',
      password: '12345678',
      name: 'Super Admin',
      role: 'superAdmin',
      createdAt: new Date()
    });
    
    await adminUser.save();
    console.log('Superadmin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin(); 