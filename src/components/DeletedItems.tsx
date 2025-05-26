import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import ItemCard from './ItemCard';

const DeletedItems: React.FC = () => {
  const items = useSelector((state: RootState) => 
    state.items.items.filter(item => item.status === 'deleted')
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No deleted items found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          showActions={true}
        />
      ))}
    </div>
  );
};

export default DeletedItems; 