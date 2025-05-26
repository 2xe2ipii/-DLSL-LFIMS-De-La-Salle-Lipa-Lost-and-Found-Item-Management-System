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
  dateReported: { //  no need to change this
    type: Date,
    default: Date.now,
    required: true
  },
  status: {
    type: String,
    enum: ['missing', 'in_custody', 'claimed', 'donated', 'deleted'],
    default: 'missing',
    required: true
  }, //  no need to change this
  location: {
    type: String
  },
  storageLocation: {
    type: String
  },
  imageUrl: { //  no need to change this
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
  foundDate: { //  no need to change this
    type: Date
  },
  foundLocation: {
    type: String
  },
  notes: {
    type: String
  },
  deletedAt: {
    type: Date
  },
  additionalData: {
    previousStatus: {
      type: String
    },
    deletedBy: {
      name: {
        type: String
      },
      type: {
        type: String
      },
      email: {
        type: String
      }
    },
    deleteDate: {
      type: Date
    },
    restoredBy: {
      name: {
        type: String
      },
      type: {
        type: String
      },
      email: {
        type: String
      }
    },
    restoreDate: {
      type: Date
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema); 