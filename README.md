# DLSL Lost and Found Item Management System (LFIMS)

A comprehensive system for managing lost and found items within the De La Salle Lipa campus.

## Overview

The DLSL Lost and Found Item Management System (LFIMS) is designed to streamline the process of managing lost and found items within the De La Salle Lipa campus. The system is used by the Student Discipline and Formation Office (SDFO) to track and manage items that have been lost and found on campus.

## Features

- **Dashboard** - Overview of statistics and metrics
- **Items Management**
  - Lost Items - Log and track lost items
  - Found Items - Log and track found items
  - Claimed Items - Record items that have been claimed by their owners
  - Donated Items - Track items that have been donated after not being claimed
- **Search and Filter** - Quickly find items using various criteria
- **Claim Verification** - Process for verifying claims to found items
- **Reports Generation** - Create monthly, yearly, and custom reports
- **User Management** - Different access levels based on roles

## Technology Stack

- **Frontend**: React, TypeScript, Material-UI
- **State Management**: Redux with Redux Toolkit
- **Routing**: React Router
- **Charts**: Chart.js with React-Chartjs-2

## Getting Started

### Prerequisites

- Node.js (v14.0 or higher)
- npm (v6.0 or higher)

### Installation

1. Clone the repository

   ```
   git clone https://github.com/your-username/dlsl-lfims.git
   cd dlsl-lfims
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Start the development server

   ```
   npm start
   ```

4. Open http://localhost:3000 to view the application in your browser

### Login Credentials (for development)

- **Admin**

  - Username: admin
  - Password: password

- **Super Admin**
  - Username: superadmin
  - Password: password

## Project Structure

```
dlsl-lfims/
├── public/
├── src/
│   ├── assets/           # Images, icons, etc.
│   │   ├── common/       # Shared components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── items/        # Item-related components
│   │   ├── layout/       # Layout components
│   │   └── reports/      # Report components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Dashboard page
│   │   ├── items/        # Items pages
│   │   ├── profile/      # User profile page
│   │   ├── reports/      # Reports pages
│   │   └── settings/     # Settings page
│   ├── store/            # Redux store
│   │   └── slices/       # Redux slices
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── package.json
└── tsconfig.json
```

## Future Development Plans

- **Database Integration**: Connect to a backend database for persistent storage
- **API Development**: Create a RESTful API for data operations
- **Mobile Application**: Develop a mobile app for easier access
- **Advanced Analytics**: Implement more sophisticated data visualization and analytics
- **Email Notifications**: Automatic notification system for item claims and status updates

## Contributors

- [Your Name](https://github.com/your-username)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
