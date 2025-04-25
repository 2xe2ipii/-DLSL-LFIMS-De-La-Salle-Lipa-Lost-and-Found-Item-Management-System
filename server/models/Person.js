const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  type: {
    type: String,
    enum: ['student', 'faculty', 'staff', 'visitor'],
    required: true
  },
  studentId: {
    type: String
  },
  employeeId: {
    type: String
  }
});

module.exports = mongoose.model('Person', PersonSchema); 