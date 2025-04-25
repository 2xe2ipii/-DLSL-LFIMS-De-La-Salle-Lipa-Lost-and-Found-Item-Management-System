const mongoose = require('mongoose');
const Item = require('./models/Item');
const Person = require('./models/Person');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for seeding data'))
  .catch(err => console.error('MongoDB connection error:', err));

// Generate random test data
const generateMockData = async () => {
  try {
    // Check if data exists
    const existingItemsCount = await Item.countDocuments();
    if (existingItemsCount > 0) {
      console.log(`Database already has ${existingItemsCount} items. Skipping seed.`);
      process.exit(0);
    }

    // Create real person examples
    const personTypes = ['student', 'faculty', 'staff', 'visitor'];
    const persons = [];

    // Students
    const students = [
      { name: 'Maria Santos', email: 'maria.santos@dlsl.edu.ph', phone: '0917-555-1234', type: 'student', studentId: 'ST2023001' },
      { name: 'Juan Dela Cruz', email: 'juan.delacruz@dlsl.edu.ph', phone: '0918-555-2345', type: 'student', studentId: 'ST2023042' },
      { name: 'Ana Reyes', email: 'ana.reyes@dlsl.edu.ph', phone: '0919-555-3456', type: 'student', studentId: 'ST2022018' },
      { name: 'Miguel Bautista', email: 'miguel.bautista@dlsl.edu.ph', phone: '0920-555-4567', type: 'student', studentId: 'ST2021105' },
      { name: 'Sofia Ramos', email: 'sofia.ramos@dlsl.edu.ph', phone: '0921-555-5678', type: 'student', studentId: 'ST2023078' },
    ];

    // Faculty
    const faculty = [
      { name: 'Dr. Jose Rizal', email: 'jose.rizal@dlsl.edu.ph', phone: '0922-555-6789', type: 'faculty', employeeId: 'F2010015' },
      { name: 'Prof. Corazon Aquino', email: 'corazon.aquino@dlsl.edu.ph', phone: '0923-555-7890', type: 'faculty', employeeId: 'F2015023' },
      { name: 'Dr. Manuel Quezon', email: 'manuel.quezon@dlsl.edu.ph', phone: '0924-555-8901', type: 'faculty', employeeId: 'F2018007' },
    ];

    // Staff
    const staff = [
      { name: 'Antonio Luna', email: 'antonio.luna@dlsl.edu.ph', phone: '0925-555-9012', type: 'staff', employeeId: 'S2019032' },
      { name: 'Gabriela Silang', email: 'gabriela.silang@dlsl.edu.ph', phone: '0926-555-0123', type: 'staff', employeeId: 'S2017045' },
    ];

    // Visitors
    const visitors = [
      { name: 'Emilio Aguinaldo', email: 'emilio.aguinaldo@example.com', phone: '0927-555-1234', type: 'visitor' },
      { name: 'Melchora Aquino', email: 'melchora.aquino@example.com', phone: '0928-555-2345', type: 'visitor' },
    ];

    // Combine all persons and save to database
    const allPersons = [...students, ...faculty, ...staff, ...visitors];
    
    for (const personData of allPersons) {
      const person = new Person(personData);
      await person.save();
      persons.push(person);
    }
    
    console.log(`Created ${persons.length} test persons`);
    
    // Item data
    const itemTypes = ['book', 'electronics', 'clothing', 'accessory', 'document', 'other'];
    const itemStatuses = ['lost', 'found', 'claimed', 'donated'];
    
    // Realistic item names by category
    const itemNamesByType = {
      book: [
        'DLSL Math Textbook - Algebra II',
        'Introduction to Computer Science',
        'Filipino Literature Anthology',
        'Advanced Physics Workbook',
        'English Grammar Handbook',
        'Chemistry Laboratory Manual',
        'World History Textbook',
        'Business Economics Hardcover',
        'National Bookstore Planner 2023',
        'Religious Studies Bible with Notes'
      ],
      electronics: [
        'iPhone 13 Pro (Space Gray)',
        'Samsung Galaxy A52 (Blue)',
        'Apple AirPods Pro',
        'Xiaomi Power Bank 10000mAh',
        'Casio FX-991ES Calculator',
        'JBL Wireless Earbuds',
        'Logitech Wireless Mouse',
        'Lenovo Laptop Charger',
        'USB Flash Drive 32GB',
        'Sony Headphones WH-1000XM4'
      ],
      clothing: [
        'DLSL Green Uniform Polo',
        'DLSL PE T-shirt (Medium)',
        'Black Jacket with Hood',
        'White Laboratory Coat',
        'Green and White Varsity Jacket',
        'Physical Education Jogging Pants',
        'Basketball Team Jersey #23',
        'Nursing Student Scrubs',
        'Thesis Defense Formal Coat',
        'Engineering Department Cap'
      ],
      accessory: [
        'Green and White DLSL Lanyard',
        'Silver Stainless Steel Watch',
        'Black Leather Wallet',
        'Prescription Glasses (Black Frame)',
        'Gold Cross Necklace',
        'Blue Umbrella with DLSL Logo',
        'Brown Leather Belt',
        'Green School Backpack',
        'Silver Ring with Inscription',
        'Red Scarf with DLSL Pattern'
      ],
      document: [
        'Civil Engineering Thesis Draft',
        'Student ID Card',
        'Birth Certificate Original',
        'Passport (Philippine)',
        'Driver\'s License',
        'School Registration Form',
        'Scholarship Application Papers',
        'Medical Certificate',
        'Transcript of Records',
        'Graduation Clearance Form'
      ],
      other: [
        'DLSL Basketball (Spalding)',
        'Guitar Pick Set',
        'Rosary Beads (White)',
        'Medicine Kit with Paracetamol',
        'Prescription Eyeglasses Case',
        'Laboratory Safety Goggles',
        'Scientific Calculator',
        'Car Keys with DLSL Keychain',
        'Stethoscope (Nursing Student)',
        'Engineering Drawing Set'
      ]
    };
    
    // Campus locations
    const locations = [
      'Main Library - Second Floor',
      'Canteen A - Table Area',
      'CBEAM Building - Room 301',
      'CITHM Building - Lecture Hall',
      'Gymnasium - Bleachers',
      'Science Laboratory - Physics Lab',
      'Student Center - Lobby',
      'LIMA Building - Ground Floor',
      'College of Nursing - Staff Room',
      'Sentrum Building - Computer Lab 2',
      'Chapel - Main Prayer Area',
      'College of Engineering - Design Studio',
      'Administration Building - Hallway',
      'Covered Walkway - Near SHS Building',
      'Parking Lot A - Near Main Gate'
    ];
    
    // Storage locations
    const storageLocations = [
      'SDFO Office - Cabinet A',
      'SDFO Office - Locker B12',
      'SDFO Office - Shelf C3',
      'Security Office - Lost and Found Box',
      'Admin Main Desk - Drawer 2',
      'Student Affairs Office - Storage Room'
    ];
    
    // Create items
    const items = [];
    
    for (let i = 1; i <= 50; i++) {
      const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      const status = itemStatuses[Math.floor(Math.random() * itemStatuses.length)];
      const reportedBy = persons[Math.floor(Math.random() * persons.length)];
      
      // Select a realistic item name based on type
      const itemNames = itemNamesByType[type];
      const name = itemNames[Math.floor(Math.random() * itemNames.length)];
      
      // Create base item
      const item = {
        type,
        name,
        description: `${name} found/lost in the campus. ${Math.random() > 0.5 ? 'Has identifying marks or labels.' : 'No identifying marks.'}`,
        color: ['Red', 'Blue', 'Black', 'White', 'Green', 'Yellow', 'Gray', 'Silver', 'Gold'][Math.floor(Math.random() * 9)],
        brand: type === 'electronics' ? ['Apple', 'Samsung', 'Sony', 'Xiaomi', 'Lenovo', 'JBL', 'Casio'][Math.floor(Math.random() * 7)] : undefined,
        dateReported: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        status,
        location: locations[Math.floor(Math.random() * locations.length)],
        reportedBy: reportedBy._id
      };
      
      // Add status-specific properties
      if (status === 'found') {
        const foundBy = persons[Math.floor(Math.random() * persons.length)];
        item.foundBy = foundBy._id;
        item.foundDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        item.foundLocation = locations[Math.floor(Math.random() * locations.length)];
        item.storageLocation = storageLocations[Math.floor(Math.random() * storageLocations.length)];
      } else if (status === 'claimed') {
        const claimedBy = persons[Math.floor(Math.random() * persons.length)];
        item.claimedBy = claimedBy._id;
        item.claimDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        
        // For claimed items, we also need found info
        const foundBy = persons[Math.floor(Math.random() * persons.length)];
        item.foundBy = foundBy._id;
        item.foundDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      } else if (status === 'donated') {
        // For donated items, add notes about donation
        item.notes = `Donated on ${new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString()} after being unclaimed for over 90 days. Authorized by SDFO Head.`;
        
        // Donated items were also found first
        const foundBy = persons[Math.floor(Math.random() * persons.length)];
        item.foundBy = foundBy._id;
        item.foundDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      }
      
      const newItem = new Item(item);
      await newItem.save();
      items.push(newItem);
    }
    
    console.log(`Created ${items.length} test items`);
    console.log('Seed data creation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating seed data:', error);
    process.exit(1);
  }
};

generateMockData(); 