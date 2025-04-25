import React, { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useRedux';
import { checkAndMarkForDonation, findPotentialMatches } from '../../store/slices/itemsSlice';

/**
 * Component responsible for running background system tasks
 * This component doesn't render anything visible
 */
const AutoTasks: React.FC = () => {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Initial check for donation-eligible items and potential matches
    // Run immediately on component mount
    runSystemChecks();
    
    // Set up interval to run system checks every 5 minutes instead of hourly
    // This ensures potential matches are discovered more quickly
    const intervalId = setInterval(runSystemChecks, 300000); // 300000 ms = 5 minutes
    
    // Clean up interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch]);
  
  // Function to run all system checks
  const runSystemChecks = () => {
    // Check for items that should be marked for donation
    dispatch(checkAndMarkForDonation())
      .then(() => console.log('Donation check completed'))
      .catch((error) => console.error('Donation check failed:', error));
    
    // Find potential matches between lost and found items
    dispatch(findPotentialMatches())
      .then(() => console.log('Match finding completed'))
      .catch((error) => console.error('Match finding failed:', error));
  };
  
  // This component doesn't render anything visible
  return null;
};

export default AutoTasks; 