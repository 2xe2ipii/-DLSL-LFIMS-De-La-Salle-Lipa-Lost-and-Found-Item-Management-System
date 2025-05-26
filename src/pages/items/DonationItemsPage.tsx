import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { changeItemStatusAPI, fetchItemsByStatus } from '../../store/slices/itemsSlice';
import { Item } from '../../types/item';

const DonationItemsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const handleDeleteConfirm = async () => {
    if (!itemToDelete?.id) return;
    
    try {
      const deleteData = {
        id: itemToDelete.id,
        status: 'deleted' as const,
        additionalData: {
          deletedBy: {
            name: user?.name || '',
            type: (user?.role === 'admin' || user?.role === 'superAdmin' ? 'staff' : 'student') as 'student' | 'faculty' | 'staff' | 'visitor',
            email: user?.email || '',
          },
          deleteDate: new Date(),
          previousStatus: itemToDelete.status // Store the current status as previous status
        }
      };

      console.log('Deleting item with data:', deleteData); // Debug log

      // Update item status to deleted
      const result = await dispatch(changeItemStatusAPI(deleteData)).unwrap();
      console.log('Delete result:', result); // Debug log
      
      // Only refresh the donated items list
      await dispatch(fetchItemsByStatus('donated'));
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error marking item as deleted:', error);
    }
  };

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default DonationItemsPage; 