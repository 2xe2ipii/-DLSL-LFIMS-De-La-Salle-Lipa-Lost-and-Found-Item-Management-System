const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

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