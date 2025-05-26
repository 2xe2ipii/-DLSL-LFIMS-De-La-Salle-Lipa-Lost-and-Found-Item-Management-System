# DLSL Lost and Found Item Management System (LFIMS)

A web application for managing lost and found items at De La Salle Lipa.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. If not cloned, create a `.env` file in the root directory with the following variables:
   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/dlsl-lfims
   JWT_SECRET=your_secret_key_here
   ```
   
   Note: If you don't have MongoDB installed locally, you can use MongoDB Atlas by setting:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/dlsl-lfims
   ```

4. Run: --> cd server --> node forceFixUsers.js

5. (Optional)Seed the database with initial data:

    ```
   npm run seed
   ```

7. Start the development server:
   ```
   npm run dev
   ```
   
   This will start:
   - React frontend on http://localhost:3001
   - Express backend on http://localhost:5001

8. npm start

## Login Credentials

- Default admin account:
  - Username: superadmin
  - Password: 12345678

## Features

### Core Features
- Lost and Found Item Management
- User Authentication
- Claim Processing
- Donation Management
- Reporting and Statistics

### New Features

#### 1. Item Image Upload
- Upload images when reporting lost items or registering found items
- View item images in the item details
- Delete images if needed

#### 2. Report Generation
- Generate various types of reports (Monthly, Yearly, Custom date range)
- Filter reports by item status
- Export reports as PDF documents
- Print reports directly

#### 3. Donation Certificate
- Generate donation certificates for unclaimed items
- Download certificates as PDF documents
- Properly formatted certificates with DLSL branding

## Troubleshooting

If you encounter "cannot reach this page" errors:

1. Make sure both frontend and backend servers are running
2. Try running them separately:
   - Frontend: `npm start`
   - Backend: `npm run server`
3. Check for MongoDB connection errors in the console
4. Ensure no other applications are using ports 3001 and 5001
5. If port 5001 is in use by another process, change it in the .env file

## Troubleshooting User Management

If you encounter issues with the User Management system, follow these steps:

### Common Issues and Solutions

1. **404 Not Found when loading admin users**:
   - Ensure the server is running (`npm run server`)
   - Check that the API routes in `authService.ts` don't have extra leading slashes
   - Verify that the superAdmin user exists in the database

2. **Cannot create admin users**:
   - Ensure you're logged in as a superAdmin
   - Check the browser console for detailed error messages
   - Verify that all required fields are filled out correctly

3. **Access Denied errors**:
   - Make sure your token is valid and not expired
   - Confirm that your user account has the 'superAdmin' role
   - Check the server logs for detailed authentication errors

### Authentication Flow

1. Only superAdmins can create admin users
2. Only superAdmins can view the list of admin users
3. Only superAdmins can reset admin passwords

### Login Credentials
Default superadmin credentials:
- Username: superadmin
- Password: 12345678

### Development Setup

To start the development environment:

```
npm run dev
```

This will start both the React frontend and Node.js backend.
