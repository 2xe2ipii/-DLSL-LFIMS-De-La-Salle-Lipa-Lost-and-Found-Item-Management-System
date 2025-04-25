const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['superAdmin', 'admin', 'viewer'],
    default: 'viewer'
  },
  profileImage: {
    type: String
  },
  department: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Direct static method to use for migration
UserSchema.statics.forceResetUser = async function(username, newPassword) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    return this.findOneAndUpdate(
      { username },
      { 
        $set: { 
          password: hashedPassword,
          lastLogin: null
        } 
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error in forceResetUser:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema); 