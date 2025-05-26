import { useDispatch, useSelector } from 'react-redux';
import { deleteItem, restoreItem } from '../store/slices/itemsSlice';
import { Item, ItemStatus } from '../types/item';
import { AppDispatch, RootState } from '../store';
import { 
  Delete as DeleteIcon, 
  Restore as RestoreIcon,
  Visibility as ViewIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

interface ItemCardProps {
  item: Item;
  onEdit?: (item: Item) => void;
  onView?: (item: Item) => void;
  showActions?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit, onView, showActions = true }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Check if user is admin or superAdmin
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  const handleDelete = async () => {
    if (!item.id) return;
    
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await dispatch(deleteItem(item.id));
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleRestore = async () => {
    if (!item.id) return;
    
    try {
      await dispatch(restoreItem({ 
        id: item.id
      }));
    } catch (error) {
      console.error('Error restoring item:', error);
    }
  };

  const getStatusColor = (status: ItemStatus) => {
    switch (status) {
      case 'missing':
        return 'bg-red-100 text-red-800';
      case 'in_custody':
        return 'bg-green-100 text-green-800';
      case 'claimed':
        return 'bg-blue-100 text-blue-800';
      case 'donated':
        return 'bg-purple-100 text-purple-800';
      case 'deleted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-sm text-gray-600">ID: {item.itemId}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status as ItemStatus)}`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      </div>

      {item.description && (
        <p className="mt-2 text-gray-700">{item.description}</p>
      )}

      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="mt-3 w-full h-48 object-cover rounded-md"
        />
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {item.location && (
          <span className="text-sm text-gray-600">
            <i className="fas fa-map-marker-alt mr-1"></i>
            {item.location}
          </span>
        )}
        {item.foundLocation && (
          <span className="text-sm text-gray-600">
            <i className="fas fa-map-marker-alt mr-1"></i>
            Found at: {item.foundLocation}
          </span>
        )}
      </div>

      {showActions && (
        <div className="mt-4 flex justify-end space-x-2">
          {item.status === 'deleted' ? (
            isAdmin && (
              <Tooltip title="Restore Item">
                <IconButton
                  onClick={handleRestore}
                  color="success"
                  size="small"
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            )
          ) : (
            <>
              {onView && (
                <Tooltip title="View Details">
                  <IconButton
                    onClick={() => onView(item)}
                    color="primary"
                    size="small"
                  >
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
              )}
              {onEdit && (
                <Tooltip title="Edit Item">
                  <IconButton
                    onClick={() => onEdit(item)}
                    color="warning"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
              {isAdmin && (
                <Tooltip title="Delete Item">
                  <IconButton
                    onClick={handleDelete}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemCard; 