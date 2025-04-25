const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Item = require('./models/Item');
const Person = require('./models/Person');
require('dotenv').config();

const createTestItems = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      dbName: 'dlsl-lfims'
    });

    console.log('Connected to MongoDB');

    // Create a test reporter
    const testReporter = new Person({
      name: 'Test Student',
      type: 'student',
      studentId: 'S12345',
      email: 'test.student@example.com',
      phone: '123-456-7890'
    });
    await testReporter.save();
    console.log('Created test reporter:', testReporter._id);

    // Create a test found-by person
    const testFinder = new Person({
      name: 'Test Staff',
      type: 'staff',
      employeeId: 'E98765',
      email: 'test.staff@example.com',
      phone: '987-654-3210'
    });
    await testFinder.save();
    console.log('Created test finder:', testFinder._id);

    // Create a test lost item
    const date = new Date();
    const typePrefix = 'BOO';
    const datePart = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const randomPart = uuidv4().substring(0, 6).toUpperCase();
    const itemId = `${typePrefix}-${datePart}-${randomPart}`;

    const lostItem = new Item({
      itemId,
      type: 'book',
      name: 'Test Textbook',
      description: 'A test calculus textbook with blue cover',
      color: 'Blue',
      brand: 'McGraw-Hill',
      dateReported: new Date(),
      status: 'lost',
      location: 'Main Library',
      imageUrl: '/uploads/2023/10/test-image.png',
      reportedBy: testReporter._id
    });
    await lostItem.save();
    console.log('Created test lost item:', lostItem._id);

    // Create a test found item
    const foundDate = new Date();
    const foundTypePrefix = 'ELE';
    const foundDatePart = `${foundDate.getFullYear()}${(foundDate.getMonth() + 1).toString().padStart(2, '0')}${foundDate.getDate().toString().padStart(2, '0')}`;
    const foundRandomPart = uuidv4().substring(0, 6).toUpperCase();
    const foundItemId = `${foundTypePrefix}-${foundDatePart}-${foundRandomPart}`;

    const foundItem = new Item({
      itemId: foundItemId,
      type: 'electronics',
      name: 'Test Smartphone',
      description: 'A black smartphone found in the cafeteria',
      color: 'Black',
      brand: 'Samsung',
      dateReported: new Date(),
      status: 'found',
      foundLocation: 'Cafeteria',
      storageLocation: 'Security Office',
      foundDate: new Date(),
      imageUrl: '/uploads/2023/10/test-image.png',
      foundBy: testFinder._id
    });
    await foundItem.save();
    console.log('Created test found item:', foundItem._id);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test items:', error);
    process.exit(1);
  }
};

createTestItems(); 