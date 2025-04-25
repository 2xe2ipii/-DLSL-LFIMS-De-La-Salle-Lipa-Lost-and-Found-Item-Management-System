const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Direct MongoDB connection string
const uri = 'mongodb://localhost:27017/dlsl-lfims';

async function fixUsers() {
  const client = new MongoClient(uri);

  try {
    // Connect directly to MongoDB
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('dlsl-lfims');
    const usersCollection = db.collection('users');

    // Delete admin user if it exists
    console.log('Deleting admin user if it exists...');
    const deleteResult = await usersCollection.deleteOne({ username: 'admin' });
    console.log(`Admin user deleted: ${deleteResult.deletedCount > 0 ? 'Yes' : 'No'}`);

    // Generate hashed password for superadmin
    console.log('Generating hashed password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('12345678', salt);
    console.log('Password hashed successfully');

    // Check if superadmin exists
    const superadminExists = await usersCollection.findOne({ username: 'superadmin' });

    if (superadminExists) {
      console.log('Superadmin user exists, updating password...');
      const updateResult = await usersCollection.updateOne(
        { username: 'superadmin' },
        { 
          $set: { 
            password: hashedPassword,
            lastLogin: null,
            role: 'superAdmin'
          } 
        }
      );
      console.log(`Superadmin updated: ${updateResult.modifiedCount > 0 ? 'Yes' : 'No'}`);
    } else {
      console.log('Creating new superadmin user...');
      const newSuperAdmin = {
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'superAdmin',
        createdAt: new Date()
      };
      
      const insertResult = await usersCollection.insertOne(newSuperAdmin);
      console.log(`Superadmin created: ${insertResult.acknowledged ? 'Yes' : 'No'}`);
    }

    // Verify the user exists with correct role
    const finalCheck = await usersCollection.findOne({ username: 'superadmin' });
    console.log('Final check - Superadmin exists:', !!finalCheck);
    if (finalCheck) {
      console.log('Username:', finalCheck.username);
      console.log('Role:', finalCheck.role);
      console.log('Password is hashed:', finalCheck.password.length > 20 ? 'Yes' : 'No');
    }
    
    console.log('User fix completed successfully');
  } catch (error) {
    console.error('Error fixing users:', error);
  } finally {
    // Close MongoDB connection
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

// Run the fix
fixUsers(); 