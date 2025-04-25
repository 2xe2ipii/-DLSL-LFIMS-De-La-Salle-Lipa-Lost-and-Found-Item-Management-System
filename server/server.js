const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();
const fs = require('fs');
const User = require('./models/User');
const mongoose = require('mongoose');

// Create the Express app
const app = express();

// Middleware
app.use(express.json());
// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization']
}));

// Add OPTIONS response for preflight requests
app.options('*', cors());

// Authentication token debugging middleware
app.use((req, res, next) => {
  const authToken = req.header('x-auth-token');
  if (authToken) {
    console.log(`Request has auth token (first 10 chars): ${authToken.substring(0, 10)}...`);
  } else {
    console.log('No auth token in request');
  }
  next();
});

// File upload middleware
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  abortOnLimit: true,
  responseOnLimit: 'File size limit has been reached (5MB)'
}));

// Serve static files from the uploads directory with enhanced configuration
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    console.log(`Serving static file: ${filePath}`);
    // Set appropriate headers for image files
    if (filePath.match(/\.(jpg|jpeg|png|gif)$/i)) {
      const ext = path.extname(filePath).substring(1).toLowerCase();
      const contentType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    }
  }
}));

// Also serve the same files under /api/uploads to match frontend expectations
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    console.log(`Serving static file via API: ${filePath}`);
    // Set appropriate headers for image files
    if (filePath.match(/\.(jpg|jpeg|png|gif)$/i)) {
      const ext = path.extname(filePath).substring(1).toLowerCase();
      const contentType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    }
  }
}));

// Add direct image serving route that can find images by filename
app.get('/api/image/:filename', (req, res) => {
  const filename = req.params.filename;
  console.log(`Direct image request for: ${filename}`);
  
  // Search for the file recursively in the uploads directory (synchronous version)
  const searchFileSync = (baseDir, targetFilename) => {
    let result = null;
    
    const search = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          if (result) break; // Stop if we've already found the file
          
          const fullPath = path.join(dir, file);
          
          try {
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
              search(fullPath);
            } else if (file === targetFilename) {
              result = fullPath;
              break;
            }
          } catch (error) {
            console.error(`Error checking file ${fullPath}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
      }
    };
    
    search(baseDir);
    return result;
  };
  
  // Search for the file
  const filePath = searchFileSync(path.join(__dirname, 'uploads'), filename);
  
  if (!filePath) {
    console.log(`File not found: ${filename}`);
    return res.status(404).send('Image not found');
  }
  
  console.log(`Found file at: ${filePath}`);
  const ext = path.extname(filePath).substring(1).toLowerCase();
  const contentType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  res.set('Content-Type', contentType);
  res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
  res.sendFile(filePath);
});

// Add a debugging route for image testing
app.get('/api/debug-image/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  console.log(`Debug image request for: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    console.log(`File exists: ${filePath}`);
    res.sendFile(filePath);
  } else {
    console.log(`File does not exist: ${filePath}`);
    res.status(404).send('Image not found');
  }
});

// Add an explicit route to test static file serving
app.get('/test-static', (req, res) => {
  res.send(`
    <h1>Static File Test</h1>
    <p>Testing static file serving from uploads directory:</p>
    <img src="/uploads/test/test-image.png" alt="Test Image" style="max-width: 300px; border: 1px solid #ddd;">
    <p><a href="/uploads/test/test.txt">Test Text File</a></p>
  `);
});

// Log all requests to help debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log(`Headers: ${JSON.stringify({
    'x-auth-token': req.headers['x-auth-token'] ? 'Present' : 'Missing',
    'content-type': req.headers['content-type'],
    'origin': req.headers['origin']
  })}`);
  next();
});

// Add a welcome route for the root path
app.get('/', (req, res) => {
  res.send('Welcome to DLSL-LFIMS API. Use /api/auth and /api/items endpoints to interact with the system.');
});

// Add a test endpoint that doesn't require auth
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'API is working', timestamp: new Date().toISOString() });
});

// Add a test endpoint to check database status
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    
    // Check MongoDB connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // Check if superadmin exists
    const superAdmin = await User.findOne({ username: 'superadmin' });
    
    res.json({
      database: {
        status: dbStatus[dbState],
        connected: dbState === 1
      },
      superAdmin: {
        exists: !!superAdmin,
        role: superAdmin?.role,
        id: superAdmin?.id
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database test failed',
      details: error.message
    });
  }
});

// Define routes with better logging
app.use('/api/auth', (req, res, next) => {
  console.log(`AUTH ROUTE: ${req.method} ${req.path}`);
  next();
}, require('./routes/authRoutes'));

app.use('/api/items', (req, res, next) => {
  console.log(`ITEMS ROUTE: ${req.method} ${req.path}`);
  next();
}, require('./routes/itemRoutes'));

app.use('/api/uploads', (req, res, next) => {
  console.log(`UPLOADS ROUTE: ${req.method} ${req.path}`);
  next();
}, require('./routes/uploadRoutes'));

app.use('/api/users', (req, res, next) => {
  console.log(`USERS ROUTE: ${req.method} ${req.path}`);
  next();
}, require('./routes/userRoutes'));

// Connect to database and then start the server
connectDB().then(async () => {
  console.log('MongoDB connected. Checking users...');
  
  try {
    // Find and remove any 'admin' user
    const adminUser = await User.findOne({ username: 'admin' });
    if (adminUser) {
      console.log('Removing old admin user');
      await User.deleteOne({ _id: adminUser._id });
      console.log('Old admin user removed successfully');
    } else {
      console.log('No old admin user found');
    }

    // Check if superadmin exists
    let superAdminUser = await User.findOne({ username: 'superadmin' });
    
    if (superAdminUser) {
      console.log('Superadmin user exists, skipping creation');
    } else {
      // Create new superadmin user
      console.log('No superadmin found, creating new superadmin user');
      
      // Generate a new salt and hash
      const salt = await require('bcryptjs').genSalt(10);
      const hashedPassword = await require('bcryptjs').hash('12345678', salt);
      
      superAdminUser = new User({
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: hashedPassword, // Use pre-hashed password to bypass middleware
        name: 'Super Admin',
        role: 'superAdmin',
        createdAt: new Date()
      });
      
      await superAdminUser.save();
      console.log('Superadmin user created successfully');
    }
    
    // Final verification
    const verifyUser = await User.findOne({ username: 'superadmin' });
    if (verifyUser) {
      console.log(`Verified superadmin exists with role: ${verifyUser.role}`);
    } else {
      console.log('WARNING: Could not verify superadmin existence');
    }
  } catch (error) {
    console.error('Error setting up users:', error);
  }
  
  // Start the server after database checks
  startServer();
}).catch(err => {
  console.error('MongoDB connection error, but continuing server startup:', err);
  startServer();
});

// Function to start the Express server
function startServer() {
  // Set the port
  const PORT = process.env.PORT || 5001;

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} 