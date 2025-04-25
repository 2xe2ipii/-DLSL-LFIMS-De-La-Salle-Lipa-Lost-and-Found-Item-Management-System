import { Item } from '../types/item';
import { isItemOlderThanDays } from './dateUtils';

/**
 * Filter items that fall within a specified date range
 */
export const filterItemsByDateRange = (
  items: Item[],
  startDate: Date,
  endDate: Date
): Item[] => {
  return items.filter(item => {
    const itemDate = item.dateReported ? new Date(item.dateReported) : 
                     item.dateFound ? new Date(item.dateFound) : 
                     item.createdAt ? new Date(item.createdAt) : 
                     null;
    
    if (!itemDate) return false;
    return itemDate >= startDate && itemDate <= endDate;
  });
};

/**
 * Count items by status
 */
export const countItemsByStatus = (items: Item[]): { 
  lost: number; 
  found: number; 
  claimed: number;
  returned: number; 
  donated: number;
  total: number;
} => {
  const statusCounts = {
    lost: 0,
    found: 0,
    claimed: 0,
    returned: 0,
    donated: 0,
    total: items.length
  };
  
  items.forEach(item => {
    if (statusCounts.hasOwnProperty(item.status)) {
      statusCounts[item.status as keyof typeof statusCounts]++;
    }
  });
  
  return statusCounts;
};

/**
 * Get unclaimed items older than specified days
 */
export const getUnclaimedOlderThan = (items: Item[], days: number): Item[] => {
  return items.filter(item => 
    (item.status === 'found') && 
    isItemOlderThanDays(item.dateReported, days)
  );
};

/**
 * Get items eligible for donation (unclaimed and older than 90 days)
 */
export const getItemsEligibleForDonation = (items: Item[]): Item[] => {
  return getUnclaimedOlderThan(items, 90);
};

/**
 * Calculate estimated donation value for an item
 */
export const calculateItemDonationValue = (item: Item): number => {
  // Base values by item type
  const baseCategoryValues: Record<string, number> = {
    'book': 15,
    'electronics': 50,
    'clothing': 20,
    'accessory': 15,
    'document': 5,
    'stationery': 10,
    'jewelry': 40,
    'bag': 25,
    'id_card': 5,
    'key': 5,
    'wallet': 20,
    'money': 0,
    'other': 15
  };
  
  // Get base value from type or default to 'Other'
  let value = baseCategoryValues[item.type] || baseCategoryValues.other;
  
  // Adjust for age (decrease value for older items)
  const ageInDays = isItemOlderThanDays(item.dateReported, 180) ? 180 : 
                   isItemOlderThanDays(item.dateReported, 90) ? 90 : 30;
  
  // Reduce value by age
  if (ageInDays >= 180) {
    value *= 0.6; // 40% reduction for items older than 6 months
  } else if (ageInDays >= 90) {
    value *= 0.8; // 20% reduction for items older than 3 months
  }
  
  return value;
};

/**
 * Group items by month
 */
export const groupItemsByMonth = (items: Item[]): Record<string, Item[]> => {
  const grouped: Record<string, Item[]> = {};
  
  items.forEach(item => {
    const date = item.dateReported ? new Date(item.dateReported) : 
                item.dateFound ? new Date(item.dateFound) : 
                item.createdAt ? new Date(item.createdAt) : 
                new Date();
    
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    
    grouped[monthYear].push(item);
  });
  
  return grouped;
};

/**
 * Sort items by age (oldest first)
 */
export const sortItemsByAge = (items: Item[]): Item[] => {
  return [...items].sort((a, b) => {
    const dateA = a.dateReported ? new Date(a.dateReported) : 
                 a.dateFound ? new Date(a.dateFound) : 
                 a.createdAt ? new Date(a.createdAt) : 
                 new Date();
    
    const dateB = b.dateReported ? new Date(b.dateReported) : 
                 b.dateFound ? new Date(b.dateFound) : 
                 b.createdAt ? new Date(b.createdAt) : 
                 new Date();
    
    return dateA.getTime() - dateB.getTime();
  });
}; 