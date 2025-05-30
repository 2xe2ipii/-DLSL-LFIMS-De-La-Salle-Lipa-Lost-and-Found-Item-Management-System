const Item = require('../models/Item');
const Person = require('../models/Person');
const { v4: uuidv4 } = require('uuid');

// Create a new Person or get existing one
const getOrCreatePerson = async (personData) => {
  if (!personData) return null;
  
  let person;
  
  // Check if the person already exists by studentId or employeeId
  if (personData.studentId) {
    person = await Person.findOne({ studentId: personData.studentId });
  } else if (personData.employeeId) {
    person = await Person.findOne({ employeeId: personData.employeeId });
  }
  
  // If person doesn't exist, create a new one
  if (!person) {
    person = new Person(personData);
    await person.save();
  }
  
  return person._id;
};

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate('reportedBy')
      .populate('claimedBy')
      .populate('foundBy')
      .sort({ dateReported: -1 });
    
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get items by status
exports.getItemsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    const items = await Item.find({ status })
      .populate('reportedBy')
      .populate('claimedBy')
      .populate('foundBy')
      .sort({ dateReported: -1 });
    
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new item
exports.createItem = async (req, res) => {
  try {
    const {
      type,
      name,
      description,
      color,
      brand,
      dateReported,
      status,
      location,
      storageLocation,
      imageUrl,
      reportedBy,
      claimedBy,
      claimDate,
      foundBy,
      foundDate,
      foundLocation,
      notes
    } = req.body;
    
    // Generate itemId with date component for better uniqueness
    const date = new Date();
    const typePrefix = type.substring(0, 3).toUpperCase();
    const datePart = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const randomPart = uuidv4().substring(0, 6).toUpperCase();
    const itemId = `${typePrefix}-${datePart}-${randomPart}`;
    
    // Handle person relationships
    const reportedByPersonId = await getOrCreatePerson(reportedBy);
    const claimedByPersonId = await getOrCreatePerson(claimedBy);
    const foundByPersonId = await getOrCreatePerson(foundBy);
    
    const newItem = new Item({
      itemId,
      type,
      name,
      description,
      color,
      brand,
      dateReported: dateReported || new Date(),
      status,
      location,
      storageLocation,
      imageUrl,
      reportedBy: reportedByPersonId,
      claimedBy: claimedByPersonId,
      claimDate,
      foundBy: foundByPersonId,
      foundDate,
      foundLocation,
      notes
    });
    
    const item = await newItem.save();
    
    // Populate the person fields before returning
    await item.populate('reportedBy');
    await item.populate('claimedBy');
    await item.populate('foundBy');
    
    res.json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update an item
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      name,
      description,
      color,
      brand,
      dateReported,
      status,
      location,
      storageLocation,
      imageUrl,
      reportedBy,
      claimedBy,
      claimDate,
      foundBy,
      foundDate,
      foundLocation,
      notes
    } = req.body;
    
    // Handle person relationships
    const reportedByPersonId = await getOrCreatePerson(reportedBy);
    const claimedByPersonId = await getOrCreatePerson(claimedBy);
    const foundByPersonId = await getOrCreatePerson(foundBy);
    
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      {
        type,
        name,
        description,
        color,
        brand,
        dateReported,
        status,
        location,
        storageLocation,
        imageUrl,
        reportedBy: reportedByPersonId,
        claimedBy: claimedByPersonId,
        claimDate,
        foundBy: foundByPersonId,
        foundDate,
        foundLocation,
        notes
      },
      { new: true }
    )
    .populate('reportedBy')
    .populate('claimedBy')
    .populate('foundBy');
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an item (only for Super Admin)
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Store the exact status before deletion
    const originalStatus = item.status;
    
    // Update the item with deleted status and store original status
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { 
        status: 'deleted',
        deletedAt: new Date(),
        additionalData: {
          previousStatus: originalStatus // Store the exact original status
        }
      },
      { new: true }
    )
    .populate('reportedBy')
    .populate('claimedBy')
    .populate('foundBy');
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Change item status
exports.changeItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, additionalData } = req.body;
    console.log('Changing item status:', { id, status, additionalData }); // Debug log
    
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const updateData = { status };
    
    // Add additional data based on the new status
    if (status === 'claimed' && additionalData?.claimedBy) {
      updateData.claimedBy = await getOrCreatePerson(additionalData.claimedBy);
      updateData.claimDate = additionalData.claimDate || new Date();
    } else if (status === 'found' && additionalData?.foundBy) {
      updateData.foundBy = await getOrCreatePerson(additionalData.foundBy);
      updateData.foundDate = additionalData.foundDate || new Date();
      updateData.foundLocation = additionalData.foundLocation;
    } else if (status === 'deleted') {
      // For deletion, store the original status and deletion info
      updateData.deletedAt = new Date();
      updateData.additionalData = {
        previousStatus: item.status, // Store the current status before deletion
        deletedBy: additionalData?.deletedBy,
        deleteDate: additionalData?.deleteDate
      };
    }
    
    console.log('Update data:', updateData); // Debug log
    
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )
    .populate('reportedBy')
    .populate('claimedBy')
    .populate('foundBy');
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    console.log('Updated item:', updatedItem); // Debug log
    res.json(updatedItem);
  } catch (error) {
    console.error('Error changing item status:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const lostCount = await Item.countDocuments({ status: 'lost' });
    const foundCount = await Item.countDocuments({ status: 'found' });
    const claimedCount = await Item.countDocuments({ status: 'claimed' });
    const donatedCount = await Item.countDocuments({ status: 'donated' });
    const missingCount = await Item.countDocuments({ status: 'missing' });
    const inCustodyCount = await Item.countDocuments({ status: 'in_custody' });
    
    // Get category statistics
    const categoryStats = await Item.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const itemCategories = {};
    categoryStats.forEach((stat) => {
      itemCategories[stat._id] = stat.count;
    });
    
    // Get monthly statistics
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyData = await Item.aggregate([
      {
        $match: {
          dateReported: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$dateReported' },
            year: { $year: '$dateReported' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Prepare monthly data for charts
    const months = [];
    const lostData = [];
    const foundData = [];
    
    // Get all unique month/year combinations
    const uniqueMonths = [...new Set(monthlyData.map(item => 
      `${item._id.year}-${item._id.month}`
    ))].sort();
    
    uniqueMonths.forEach(monthKey => {
      const [year, month] = monthKey.split('-');
      const monthName = new Date(parseInt(year), parseInt(month) - 1, 1)
        .toLocaleString('default', { month: 'short' });
      
      months.push(`${monthName} ${year}`);
      
      const lostItem = monthlyData.find(item => 
        item._id.year === parseInt(year) && 
        item._id.month === parseInt(month) && 
        item._id.status === 'lost'
      );
      
      const foundItem = monthlyData.find(item => 
        item._id.year === parseInt(year) && 
        item._id.month === parseInt(month) && 
        item._id.status === 'found'
      );
      
      lostData.push(lostItem ? lostItem.count : 0);
      foundData.push(foundItem ? foundItem.count : 0);
    });
    
    // Calculate success rate (claimed / (lost + found))
    const totalItems = lostCount + foundCount + claimedCount + donatedCount + missingCount + inCustodyCount;
    const successRate = totalItems > 0 
      ? Math.round((claimedCount / totalItems) * 100) 
      : 0;
    
    res.json({
      lostItems: lostCount,
      foundItems: foundCount,
      claimedItems: claimedCount,
      donatedItems: donatedCount,
      missingItems: missingCount,
      inCustodyItems: inCustodyCount,
      itemCategories,
      monthlyData: {
        labels: months,
        lost: lostData,
        found: foundData
      },
      successRate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Restore a deleted item
exports.restoreItem = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Restoring item:', id); // Debug log

    // Find the item first to get its previous status
    const item = await Item.findById(id);
    if (!item) {
      console.error('Item not found:', id);
      return res.status(404).json({ message: 'Item not found' });
    }

    // Get the previous status from additionalData
    const previousStatus = item.additionalData?.previousStatus;
    console.log('Previous status:', previousStatus); // Debug log

    if (!previousStatus) {
      console.error('No previous status found for item:', id);
      return res.status(400).json({ message: 'No previous status found for this item' });
    }

    // Update the item with the original status and clean up deletion-related fields
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      {
        $set: {
          status: previousStatus, // Use the exact previous status
          additionalData: {
            ...item.additionalData,
            restoredBy: req.user,
            restoreDate: new Date()
          }
        },
        $unset: {
          deletedAt: 1,
          deletedBy: 1,
          deleteDate: 1
        }
      },
      { new: true }
    );

    console.log('Item restored successfully:', updatedItem); // Debug log
    res.json(updatedItem);
  } catch (error) {
    console.error('Error restoring item:', error);
    res.status(500).json({ message: 'Error restoring item', error: error.message });
  }
}; 