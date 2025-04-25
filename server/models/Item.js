const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    enum: ['book', 'electronics', 'clothing', 'accessory', 'document', 'stationery', 'jewelry', 'bag', 'id_card', 'key', 'wallet', 'money', 'other'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  color: {
    type: String
  },
  brand: {
    type: String
  },
  dateReported: {
    type: Date,
    default: Date.now,
    required: true
  },
  status: {
    type: String,
    enum: ['lost', 'found', 'claimed', 'donated'],
    required: true
  },
  location: {
    type: String
  },
  storageLocation: {
    type: String
  },
  imageUrl: {
    type: String
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Person'
  },
  claimedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Person'
  },
  claimDate: {
    type: Date
  },
  foundBy: {
    type: Schema.Types.ObjectId,
    ref: 'Person'
  },
  foundDate: {
    type: Date
  },
  foundLocation: {
    type: String
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema); 