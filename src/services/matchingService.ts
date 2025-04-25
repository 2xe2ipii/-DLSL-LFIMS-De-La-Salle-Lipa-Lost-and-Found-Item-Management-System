import { Item } from '../types/item';

/**
 * Calculate a similarity score between a lost item and a found item
 * Higher score means better match
 * Only considers: location match, color match, and brand match per requirements
 */
const calculateSimilarityScore = (lostItem: Item, foundItem: Item): number => {
  let score = 0;
  
  // FACTOR 1: Location proximity (most important factor)
  if (lostItem.location && foundItem.foundLocation) {
    const lostLoc = lostItem.location.toLowerCase();
    const foundLoc = foundItem.foundLocation.toLowerCase();
    
    if (lostLoc === foundLoc) {
      // Exact location match is heavily weighted
      score += 50;
    } else {
      // Partial location match
      const lostLocWords = lostLoc.split(' ');
      const foundLocWords = foundLoc.split(' ');
      
      const matchingLocWords = lostLocWords.filter(word => 
        foundLocWords.some(foundWord => foundWord.includes(word) || word.includes(foundWord))
      );
      
      if (matchingLocWords.length > 0) {
        score += 30 * (matchingLocWords.length / Math.max(lostLocWords.length, foundLocWords.length));
      }
    }
  }
  
  // FACTOR 2: Color match
  if (lostItem.color && foundItem.color) {
    if (lostItem.color.toLowerCase() === foundItem.color.toLowerCase()) {
      // Exact color match
      score += 30;
    } else {
      // Check for partial color match (e.g., "dark blue" and "blue")
      const lostColor = lostItem.color.toLowerCase();
      const foundColor = foundItem.color.toLowerCase();
      
      if (lostColor.includes(foundColor) || foundColor.includes(lostColor)) {
        score += 15;
      }
    }
  }
  
  // FACTOR 3: Brand match
  if (lostItem.brand && foundItem.brand) {
    if (lostItem.brand.toLowerCase() === foundItem.brand.toLowerCase()) {
      // Exact brand match
      score += 20;
    } else {
      // Check for partial brand match
      const lostBrand = lostItem.brand.toLowerCase();
      const foundBrand = foundItem.brand.toLowerCase();
      
      if (lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand)) {
        score += 10;
      }
    }
  }
  
  // Same item type is a minor factor (just to provide some additional context)
  if (lostItem.type === foundItem.type) {
    score += 5;
  }
  
  return Math.min(100, score); // Cap score at 100
};

/**
 * Find potential matches for a lost item from a list of found items
 * Returns array of found items with match scores
 */
const findPotentialMatches = (lostItem: Item, foundItems: Item[]): Array<{item: Item, score: number}> => {
  // Make sure we're only looking for matches for lost items
  if (lostItem.status !== 'lost') {
    return [];
  }
  
  // Filter to ensure we only match with 'found' items that aren't already claimed or donated
  const availableFoundItems = foundItems.filter(item => item.status === 'found');
  
  // Calculate score for each found item
  const scoredItems = availableFoundItems.map(foundItem => ({
    item: foundItem,
    score: calculateSimilarityScore(lostItem, foundItem)
  }));
  
  // Filter items with score above threshold and sort by score descending
  const matches = scoredItems
    .filter(item => item.score >= 25) // Based on new scoring system (lower threshold since fewer factors)
    .sort((a, b) => b.score - a.score);
  
  return matches;
};

/**
 * Find all potential matches between lost and found items
 * Returns a map of lost item IDs to arrays of potential matches
 */
const findAllMatches = (lostItems: Item[], foundItems: Item[]): Record<string, Array<{item: Item, score: number}>> => {
  const matchesMap: Record<string, Array<{item: Item, score: number}>> = {};
  
  // Only process items that have 'lost' status
  const actualLostItems = lostItems.filter(item => item.status === 'lost');
  const actualFoundItems = foundItems.filter(item => item.status === 'found');
  
  for (const lostItem of actualLostItems) {
    const matches = findPotentialMatches(lostItem, actualFoundItems);
    if (matches.length > 0) {
      matchesMap[lostItem.id || lostItem._id || ''] = matches;
    }
  }
  
  return matchesMap;
};

/**
 * Get items eligible for donation (unclaimed after 3 months)
 */
export const getItemsEligibleForDonation = (items: Item[]): Item[] => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  return items.filter(item => 
    // Must be in found status
    item.status === 'found' &&
    // Must have been found more than 3 months ago
    ((item.foundDate && new Date(item.foundDate) <= threeMonthsAgo) || 
     (item.dateFound && new Date(item.dateFound) <= threeMonthsAgo) ||
     (item.createdAt && new Date(item.createdAt) <= threeMonthsAgo)) &&
    // Must not be claimed
    !item.claimedBy
  );
};

const matchingService = {
  calculateSimilarityScore,
  findPotentialMatches,
  findAllMatches,
  getItemsEligibleForDonation
};

export default matchingService; 