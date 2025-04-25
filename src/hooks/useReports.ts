import { useState, useCallback } from 'react';
import { Item } from '../types/item';
import { generateReport } from '../services/reportService';
import { DateRange } from '../utils/dateUtils';
import { ReportType, ReportOptions } from '../types/reports';

// Custom hook for report generation
const useReports = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Generate items report
  const generateItemsReport = useCallback((items: Item[], dateRange?: DateRange) => {
    setLoading(true);
    setError(null);
    
    try {
      const options: ReportOptions = {
        reportType: 'itemsDetail',
        title: 'Items Report',
        items,
        dateRange
      };
      
      const report = generateReport(items, options);
      setLoading(false);
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred generating the report';
      console.error('Error generating items report:', err);
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  // Generate unclaimed items report
  const generateUnclaimedItemsReport = useCallback((items: Item[], dateRange?: DateRange) => {
    setLoading(true);
    setError(null);
    
    try {
      // Filter for only found items that are unclaimed (90+ days old)
      const unclaimedItems = items.filter(item => {
        if (item.status === 'found' && item.dateReported) {
          const reportDate = new Date(item.dateReported);
          return reportDate.getTime() < Date.now() - (90 * 24 * 60 * 60 * 1000);
        }
        return false;
      });
      
      const options: ReportOptions = {
        reportType: 'itemsDetail',
        title: 'Unclaimed Items Report',
        items: unclaimedItems,
        dateRange
      };
      
      const report = generateReport(unclaimedItems, options);
      setLoading(false);
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred generating the unclaimed items report';
      console.error('Error generating unclaimed items report:', err);
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  // Generate donation list report
  const generateDonationListReport = useCallback((items: Item[], dateRange?: DateRange) => {
    setLoading(true);
    setError(null);
    
    try {
      const options: ReportOptions = {
        reportType: 'donationReport',
        title: 'Donation List Report',
        items,
        dateRange
      };
      
      const report = generateReport(items, options);
      setLoading(false);
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred generating the donation list report';
      console.error('Error generating donation list report:', err);
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  // Generate donation certificate
  const generateDonationCertificate = useCallback((item: Item) => {
    setLoading(true);
    setError(null);
    
    try {
      const options: ReportOptions = {
        reportType: 'custom',
        title: 'Donation Certificate',
        items: [item],
        donationInfo: {
          donorName: 'De La Salle Lipa',
          donorContact: 'Lost and Found Office',
          itemDescription: `${item.name} (${item.type})`,
          donationDate: new Date().toISOString().split('T')[0]
        }
      };
      
      const report = generateReport([item], options);
      setLoading(false);
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred generating the donation certificate';
      console.error('Error generating donation certificate:', err);
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  return {
    loading,
    error,
    generateItemsReport,
    generateUnclaimedItemsReport,
    generateDonationListReport,
    generateDonationCertificate
  };
};

export default useReports; 