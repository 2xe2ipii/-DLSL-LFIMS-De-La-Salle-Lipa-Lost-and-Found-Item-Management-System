import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Item } from '../types/item';
import { formatDate } from '../utils/dateUtils';

// Define interfaces for report generation
export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export type ReportType = 'summary' | 'detailed' | 'list' | 'donation' | 'claimed' | 'itemsDetail' | 'donationReport' | 'custom' | 'itemsList' | 'donationCertificate';

export interface ReportOptions {
  reportType: ReportType;
  title: string;
  dateRange?: DateRange;
  filters?: {
    categories?: string[];
    locations?: string[];
    statuses?: string[];
  };
  certificateData?: {
    itemName: string;
    itemId: string;
    organization: string;
    contactPerson: string;
    donationDate: Date;
  };
}

// Month names for reports
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface Statistics {
  total: number;
  found: number;
  claimed: number;
  claimRate: number;
  byCategory: Record<string, number>;
  byLocation: Record<string, number>;
  byStatus: Record<string, number>;
  byMonth: Array<{
    found: number;
    claimed: number;
    lost: number;
  }>;
}

// Cache for storing generated reports to avoid regeneration
const reportCache = new Map<string, { blob: Blob, timestamp: number }>();
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

// Helper function to check if a date is within range - optimized to handle undefined values
const isDateInRange = (date: Date | string | undefined, range?: DateRange): boolean => {
  if (!date || !range || (!range.startDate && !range.endDate)) return true;
  
  const itemDate = date instanceof Date ? date : new Date(date);
  
  if (range.startDate && range.endDate) {
    return itemDate >= range.startDate && itemDate <= range.endDate;
  } else if (range.startDate) {
    return itemDate >= range.startDate;
  } else if (range.endDate) {
    return itemDate <= range.endDate;
  }
  
  return true;
};

// Helper to check if an item is eligible for donation (older than 3 months)
const isEligibleForDonation = (item: Item): boolean => {
  if (item.status !== 'found') return false;
  
  const datesToCheck = [item.foundDate, item.dateReported, item.createdAt];
  const earliestDate = datesToCheck
    .filter(date => date !== undefined)
    .map(date => new Date(date as Date | string))
    .sort((a, b) => a.getTime() - b.getTime())[0];
  
  if (!earliestDate) return false;
  
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  return earliestDate < threeMonthsAgo;
};

// Helper to safely format a date that might be a string or Date
const formatDateSafe = (date: string | Date | undefined): string => {
  if (!date) return 'N/A';
  try {
    return formatDate(typeof date === 'string' ? new Date(date) : date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Generate a cache key for a report based on options and items
const generateCacheKey = (items: Item[], options: ReportOptions): string => {
  const itemsHash = items.map(i => i.id).join('-');
  return `${options.reportType}-${options.title}-${JSON.stringify(options.dateRange)}-${JSON.stringify(options.filters)}-${itemsHash}`;
};

// Ensure category field is properly handled (might be called "type" in some places)
const processItemForReport = (item: Item) => {
  // Create a copy of the item to avoid modifying the original
  const processedItem = { ...item };
  
  // Handle potential "type" field being used instead of "category"
  if (!processedItem.category && processedItem.type) {
    processedItem.category = processedItem.type as string;
  }
  
  return processedItem;
};

// Main report generation function with caching
export const generateReport = async (items: Item[], options: ReportOptions): Promise<Blob> => {
  console.log(`Generating ${options.reportType} report with ${items.length} items`);
  
  // Process all items to ensure category field is present
  const processedItems = items.map(processItemForReport);
  
  // Try to get from cache first
  const cacheKey = generateCacheKey(processedItems, options);
  const cachedReport = reportCache.get(cacheKey);
  
  if (cachedReport && (Date.now() - cachedReport.timestamp) < CACHE_EXPIRY_TIME) {
    console.log('Returning cached report');
    return cachedReport.blob;
  }
  
  // Filter items based on date range and other filters - optimized with early returns
  const filteredItems = processedItems.filter(item => {
    // Apply date filter if specified
    const dateToCheck = item.dateReported || item.createdAt;
    if (!isDateInRange(dateToCheck, options.dateRange)) {
      return false;
    }
    
    // Apply category filter
    if (options.filters?.categories?.length && item.category && 
        !options.filters.categories.includes(item.category)) {
      return false;
    }
    
    // Apply location filter
    if (options.filters?.locations?.length && item.location &&
        !options.filters.locations.includes(item.location)) {
      return false;
    }
    
    // Apply status filter
    if (options.filters?.statuses?.length && 
        !options.filters.statuses.includes(item.status)) {
      return false;
    }
    
    return true;
  });
  
  console.log(`Filtered down to ${filteredItems.length} items`);
  
  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  
  // Add report generation info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report generated on: ${formatDate(new Date())}`, 14, 30);
  doc.text(`Total items: ${filteredItems.length}`, 14, 35);
  
  // Add filters information if any
  let yPos = 40;
  if (options.dateRange?.startDate || options.dateRange?.endDate) {
    const dateRangeText = `Date Range: ${options.dateRange.startDate ? formatDate(options.dateRange.startDate) : 'Any'} to ${options.dateRange.endDate ? formatDate(options.dateRange.endDate) : 'Any'}`;
    doc.text(dateRangeText, 14, yPos);
    yPos += 5;
  }
  
  if (options.filters) {
    if (options.filters.categories?.length) {
      doc.text(`Categories: ${options.filters.categories.join(', ')}`, 14, yPos);
      yPos += 5;
    }
    
    if (options.filters.locations?.length) {
      doc.text(`Locations: ${options.filters.locations.join(', ')}`, 14, yPos);
      yPos += 5;
    }
    
    if (options.filters.statuses?.length) {
      doc.text(`Statuses: ${options.filters.statuses.join(', ')}`, 14, yPos);
      yPos += 5;
    }
  }
  
  // Add line separator
  doc.setLineWidth(0.5);
  doc.line(14, yPos, doc.internal.pageSize.getWidth() - 14, yPos);
  yPos += 10;
  
  // Generate content based on report type - use dedicated generators
  switch (options.reportType) {
    case 'list':
    case 'itemsList':
      await generateItemsListReport(doc, filteredItems, yPos);
      break;
    case 'detailed':
    case 'itemsDetail':
      await generateItemsDetailReport(doc, filteredItems, yPos);
      break;
    case 'summary':
    case 'custom':
      await generateSummaryReport(doc, filteredItems, yPos, options);
      break;
    case 'donation':
    case 'donationReport':
      await generateDonationReport(doc, filteredItems, yPos);
      break;
    case 'claimed':
      await generateClaimedItemsReport(doc, filteredItems, yPos);
      break;
    case 'donationCertificate':
      generateDonationCertificate(doc, options);
      break;
    default:
      doc.text('Invalid report type specified', 14, yPos);
  }
  
  // Add page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${totalPages}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }
  
  // Convert to blob
  const pdfBlob = doc.output('blob');
  
  // Cache the generated report
  reportCache.set(cacheKey, { blob: pdfBlob, timestamp: Date.now() });
  
  return pdfBlob;
};

// Generate a table listing of items - optimized for large datasets with chunking
const generateItemsListReport = async (doc: jsPDF, items: Item[], startY: number) => {
  console.log('Generating items list report');
  
  // Define columns for the table
  const columns = [
    { header: 'Item ID', dataKey: 'itemId' },
    { header: 'Name', dataKey: 'name' },
    { header: 'Category', dataKey: 'category' },
    { header: 'Location', dataKey: 'location' },
    { header: 'Date Reported', dataKey: 'dateReported' },
    { header: 'Status', dataKey: 'status' }
  ];
  
  // Prepare data for the table - with chunking for large datasets
  const CHUNK_SIZE = 100; // Process in chunks of 100 items
  const chunkCount = Math.ceil(items.length / CHUNK_SIZE);
  
  let currentY = startY;
  
  for (let i = 0; i < chunkCount; i++) {
    const chunk = items.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    
    const data = chunk.map(item => ({
      itemId: item.itemId || item.id || 'N/A',
      name: item.name,
      category: item.category || item.type || 'N/A',
      location: item.foundLocation || item.location || 'N/A',
      dateReported: item.dateReported ? formatDateSafe(item.dateReported) : 'N/A',
      status: item.status || 'N/A'
    }));
    
    // Add the table chunk to the PDF
    (doc as any).autoTable({
      startY: i === 0 ? currentY : (doc as any).lastAutoTable.finalY + 5,
      head: i === 0 ? [columns.map(col => col.header)] : [],
      body: data.map(item => columns.map(col => item[col.dataKey as keyof typeof item] || 'N/A')),
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      margin: { top: 10, right: 14, bottom: 10, left: 14 }
    });
    
    // Yield to main thread to prevent UI blocking for large reports
    if (i < chunkCount - 1) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
};

// Generate a detailed report showing all item information - with optimized pagination
const generateItemsDetailReport = async (doc: jsPDF, items: Item[], startY: number) => {
  console.log('Generating items detail report');
  
  let currentY = startY;
  const CHUNK_SIZE = 10; // Process in chunks of 10 detailed items
  const chunkCount = Math.ceil(items.length / CHUNK_SIZE);
  
  for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
    const chunk = items.slice(chunkIndex * CHUNK_SIZE, (chunkIndex + 1) * CHUNK_SIZE);
    
    for (let i = 0; i < chunk.length; i++) {
      const item = chunk[i];
      const itemIndex = chunkIndex * CHUNK_SIZE + i;
      
      // Check if we need a new page
      if (currentY > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        currentY = 20;
      }
      
      // Item header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Item #${itemIndex + 1}: ${item.name}`, 14, currentY);
      currentY += 8;
      
      // Item details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const details = [
        `Item ID: ${item.itemId || item.id || 'N/A'}`,
        `Category: ${item.category || item.type || 'N/A'}`,
        `Found Location: ${item.foundLocation || 'N/A'}`,
        `Last Seen Location: ${item.location || 'N/A'}`,
        `Status: ${item.status || 'N/A'}`,
        `Date Reported: ${item.dateReported ? formatDateSafe(item.dateReported) : 'N/A'}`,
        `Date Found: ${item.foundDate ? formatDateSafe(item.foundDate) : 'N/A'}`,
        `Date Claimed: ${item.claimedDate ? formatDateSafe(item.claimedDate) : 'N/A'}`,
        `Claimed By: ${typeof item.claimedBy === 'object' ? item.claimedBy?.name || 'N/A' : item.claimedBy || 'N/A'}`
      ];
      
      details.forEach(detail => {
        doc.text(detail, 14, currentY);
        currentY += 5;
      });
      
      // Description
      doc.setFont('helvetica', 'bold');
      doc.text('Description:', 14, currentY);
      currentY += 5;
      
      doc.setFont('helvetica', 'normal');
      const description = item.description || 'No description provided';
      
      // Split description into lines to avoid overflow and optimize for long texts
      const maxWidth = doc.internal.pageSize.getWidth() - 28;
      const descriptionLines = doc.splitTextToSize(description, maxWidth);
      
      // Check if description will overflow to a new page
      if (currentY + (descriptionLines.length * 5) > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        currentY = 20;
        doc.setFont('helvetica', 'bold');
        doc.text(`Item #${itemIndex + 1} (continued)`, 14, currentY);
        currentY += 8;
        doc.setFont('helvetica', 'normal');
      }
      
      doc.text(descriptionLines, 14, currentY);
      currentY += descriptionLines.length * 5 + 10;
      
      // Add separator between items
      if (i < chunk.length - 1 || chunkIndex < chunkCount - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(14, currentY - 5, doc.internal.pageSize.getWidth() - 14, currentY - 5);
        currentY += 5;
      }
    }
    
    // Yield to main thread to prevent UI blocking for large reports
    if (chunkIndex < chunkCount - 1) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
};

// Generate a summary report with statistics - optimized calculation logic
const generateSummaryReport = async (doc: jsPDF, items: Item[], startY: number, options?: ReportOptions) => {
  console.log('Generating summary report');
  
  // Determine if this is a monthly or yearly report
  const isMonthlyReport = options?.dateRange?.startDate && 
    options.dateRange.startDate.getMonth() === options.dateRange.endDate?.getMonth();
  
  const isYearlyReport = options?.dateRange?.startDate && 
    options.dateRange.startDate.getFullYear() === options.dateRange.endDate?.getFullYear() &&
    options.dateRange.startDate.getMonth() === 0 &&
    options.dateRange.endDate?.getMonth() === 11;

  // Apply initial filtering based on date range
  const dateFilteredItems = options?.dateRange
    ? items.filter(item => isDateInRange(item.dateReported || item.createdAt, options.dateRange))
    : items;
  
  // Separate items by status for analysis
  const foundItems = dateFilteredItems.filter(item => 
    // All items that were ever in "found" status, including those now claimed
    item.status === 'found' || item.status === 'claimed' || item.status === 'donated'
  );
  
  const claimedItems = dateFilteredItems.filter(item => item.status === 'claimed');
  
  // Get foundDate or dateReported for location analysis
  const foundItemsWithLocation = foundItems.filter(item => 
    item.foundLocation || item.location
  );
  
  // Calculate statistics
  const statistics: Statistics = {
    total: dateFilteredItems.length,
    found: foundItems.length,
    claimed: claimedItems.length,
    claimRate: foundItems.length > 0 ? (claimedItems.length / foundItems.length) * 100 : 0,
    byCategory: {},
    byLocation: {},
    byStatus: {},
    byMonth: Array(12).fill(0).map(() => ({ found: 0, claimed: 0, lost: 0 }))
  };
  
  // Process all items to build statistics
  dateFilteredItems.forEach(item => {
    // Process by status
    if (item.status) {
      statistics.byStatus[item.status] = (statistics.byStatus[item.status] || 0) + 1;
    }
    
    // Process by category
    if (item.category || item.type) {
      const category = item.category || item.type as string;
      statistics.byCategory[category] = (statistics.byCategory[category] || 0) + 1;
    }
    
    // For found items, analyze by location
    if ((item.status === 'found' || item.status === 'claimed' || item.status === 'donated') && 
        (item.foundLocation || item.location)) {
      const locationValue = item.foundLocation || item.location || 'Unknown';
      statistics.byLocation[locationValue] = (statistics.byLocation[locationValue] || 0) + 1;
    }
    
    // For yearly reports, track monthly data
    if (isYearlyReport && (item.dateReported || item.createdAt)) {
      const date = new Date(item.dateReported || item.createdAt as Date);
      const month = date.getMonth();
      
      if (item.status === 'found' || item.status === 'claimed' || item.status === 'donated') {
        statistics.byMonth[month].found++;
      }
      if (item.status === 'claimed') {
        statistics.byMonth[month].claimed++;
      }
      if (item.status === 'lost') {
        statistics.byMonth[month].lost++;
      }
    }
  });
  
  // Calculate previous period comparison if this is a monthly report
  let previousPeriodComparison = null;
  if (isMonthlyReport && options?.dateRange?.startDate) {
    const currentStartDate = options.dateRange.startDate;
    const currentEndDate = options.dateRange.endDate || currentStartDate;
    
    // Calculate previous month dates
    const prevMonth = currentStartDate.getMonth() === 0 ? 11 : currentStartDate.getMonth() - 1;
    const prevYear = currentStartDate.getMonth() === 0 ? currentStartDate.getFullYear() - 1 : currentStartDate.getFullYear();
    const prevStartDate = new Date(prevYear, prevMonth, 1);
    const prevEndDate = new Date(prevYear, prevMonth + 1, 0); // Last day of prev month
    
    // Filter items for previous month
    const prevMonthItems = items.filter(item => {
      const date = item.dateReported || item.createdAt;
      if (!date) return false;
      
      const itemDate = new Date(date);
      return itemDate >= prevStartDate && itemDate <= prevEndDate;
    });
    
    // Calculate previous month statistics
    const prevFoundItems = prevMonthItems.filter(item => 
      item.status === 'found' || item.status === 'claimed' || item.status === 'donated'
    );
    
    const prevClaimedItems = prevMonthItems.filter(item => item.status === 'claimed');
    
    const prevClaimRate = prevFoundItems.length > 0 ? 
      (prevClaimedItems.length / prevFoundItems.length) * 100 : 0;
    
    previousPeriodComparison = {
      found: prevFoundItems.length,
      claimed: prevClaimedItems.length,
      claimRate: prevClaimRate,
      foundChange: prevFoundItems.length > 0 ? 
        ((foundItems.length - prevFoundItems.length) / prevFoundItems.length) * 100 : 0,
      claimRateChange: prevClaimRate > 0 ? 
        (((statistics.claimRate ?? 0) - prevClaimRate) / prevClaimRate) * 100 : 0
    };
  }
  
  let currentY = startY;
  
  // Total items section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Items Summary', 14, currentY);
  currentY += 10;
  
  // Add item counts and claim rate
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Items Found: ${statistics.found}`, 14, currentY);
  currentY += 7;
  doc.text(`Total Items Claimed: ${statistics.claimed}`, 14, currentY);
  currentY += 7;
  doc.text(`Claim Success Rate: ${(statistics.claimRate ?? 0).toFixed(1)}%`, 14, currentY);
  currentY += 7;
  
  // If we have previous period data, add comparison
  if (previousPeriodComparison) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Comparison with Previous Month:', 14, currentY);
    currentY += 7;
    
    doc.setFont('helvetica', 'normal');
    const foundChangeText = `Found Items: ${previousPeriodComparison.foundChange >= 0 ? '+' : ''}${previousPeriodComparison.foundChange.toFixed(1)}%`;
    doc.text(foundChangeText, 14, currentY);
    currentY += 7;
    
    const claimRateChangeText = `Claim Rate: ${previousPeriodComparison.claimRateChange >= 0 ? '+' : ''}${previousPeriodComparison.claimRateChange.toFixed(1)}%`;
    doc.text(claimRateChangeText, 14, currentY);
    currentY += 12;
  } else {
    currentY += 5;
  }
  
  // Add a line separator
  doc.setLineWidth(0.5);
  doc.line(14, currentY, doc.internal.pageSize.getWidth() - 14, currentY);
  currentY += 10;
  
  // For yearly reports, add monthly trends chart
  if (isYearlyReport) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Trends', 14, currentY);
    currentY += 10;
    
    // Create data for monthly trends table
    const monthlyData = [];
    for (let i = 0; i < 12; i++) {
      const monthStats = statistics.byMonth[i];
      const claimRate = monthStats.found > 0 ? (monthStats.claimed / monthStats.found) * 100 : 0;
      
      monthlyData.push([
        months[i],
        monthStats.found.toString(),
        monthStats.claimed.toString(),
        `${claimRate.toFixed(1)}%`,
        monthStats.lost.toString()
      ]);
    }
    
    // Add the monthly trends table
    (doc as any).autoTable({
      startY: currentY,
      head: [['Month', 'Found', 'Claimed', 'Claim Rate', 'Lost Reports']],
      body: monthlyData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      margin: { top: 10, right: 14, bottom: 10, left: 14 }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (currentY > doc.internal.pageSize.getHeight() - 100) {
      doc.addPage();
      currentY = 20;
    }
  }
  
  // Location breakdown - using only found items
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Found Items by Location', 14, currentY);
  currentY += 5;
  
  // Create locations table
  const locationData = Object.entries(statistics.byLocation)
    .sort((a, b) => b[1] - a[1]) // Sort by count, descending
    .map(([location, count]) => [
      location,
      count.toString(),
      `${((count / foundItems.length) * 100).toFixed(1)}%`
    ]);
  
  // If no locations found, add a default row
  if (locationData.length === 0) {
    locationData.push(['No locations found', '0', '0%']);
  }
  
  (doc as any).autoTable({
    startY: currentY,
    head: [['Location', 'Count', 'Percentage']],
    body: locationData,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    margin: { top: 10, right: 14, bottom: 10, left: 14 }
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 10;
  
  // Check if we need a new page
  if (currentY > doc.internal.pageSize.getHeight() - 100) {
    doc.addPage();
    currentY = 20;
  }
  
  // Categories breakdown
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Found Items by Category', 14, currentY);
  currentY += 5;
  
  // Create categories table for found items only
  const foundCategories: Record<string, number> = {};
  foundItems.forEach(item => {
    const category = item.category || item.type || 'Unknown';
    foundCategories[category] = (foundCategories[category] || 0) + 1;
  });
  
  const categoryData = Object.entries(foundCategories)
    .sort((a, b) => b[1] - a[1]) // Sort by count, descending
    .map(([category, count]) => [
      category,
      count.toString(),
      `${((count / foundItems.length) * 100).toFixed(1)}%`
    ]);
  
  // If no categories found, add a default row
  if (categoryData.length === 0) {
    categoryData.push(['No categories found', '0', '0%']);
  }
  
  (doc as any).autoTable({
    startY: currentY,
    head: [['Category', 'Count', 'Percentage']],
    body: categoryData,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    margin: { top: 10, right: 14, bottom: 10, left: 14 }
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 15;
  
  // Add a section for items eligible for donation (3+ months old)
  const eligibleItems = items.filter(item => isEligibleForDonation(item));
  
  if (eligibleItems.length > 0) {
    // Add a page break if we're close to the bottom
    if (currentY > doc.internal.pageSize.getHeight() - 100) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Items Eligible for Donation (Older than 3 Months): ${eligibleItems.length}`, 14, currentY);
    currentY += 10;
    
    // Table columns
    const eligibleColumns = [
      { header: 'Item ID', dataKey: 'itemId' },
      { header: 'Name', dataKey: 'name' },
      { header: 'Category', dataKey: 'category' },
      { header: 'Found Date', dataKey: 'foundDate' },
      { header: 'Age (Days)', dataKey: 'age' }
    ];
    
    // Prepare data
    const eligibleData = eligibleItems.map(item => {
      const date = item.foundDate || item.dateReported || item.createdAt;
      const itemDate = date ? new Date(date) : null;
      const today = new Date();
      const ageInDays = itemDate ? Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)) : 'N/A';
      
      return {
        itemId: item.itemId || item.id || 'N/A',
        name: item.name,
        category: item.category || item.type || 'N/A',
        foundDate: itemDate ? formatDateSafe(itemDate) : 'N/A',
        age: typeof ageInDays === 'number' ? ageInDays.toString() : ageInDays
      };
    });
    
    // Add the table to the PDF
    (doc as any).autoTable({
      startY: currentY,
      head: [eligibleColumns.map(col => col.header)],
      body: eligibleData.map(item => eligibleColumns.map(col => item[col.dataKey as keyof typeof item] || 'N/A')),
      theme: 'grid',
      headStyles: {
        fillColor: [231, 76, 60], // Red color to highlight these items
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      margin: { top: 10, right: 14, bottom: 10, left: 14 }
    });
    
    // Add a note about the donation policy
    currentY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Note: Items listed above have been in storage for more than 3 months and are eligible for donation according to policy.', 14, currentY);
  }
};

// Generate a donation report - optimized for better display
const generateDonationReport = async (doc: jsPDF, items: Item[], startY: number) => {
  console.log('Generating donation report');
  
  // Filter items that have been donated or are eligible for donation
  const donatedItems = items.filter(item => item.status === 'donated' || item.donatedTo);
  const eligibleItems = items.filter(item => 
    item.status === 'found' && 
    item.foundDate && 
    (new Date().getTime() - new Date(item.foundDate).getTime()) > (90 * 24 * 60 * 60 * 1000) // 90 days
  );
  
  let currentY = startY;
  
  // Add donated items section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Donated Items', 14, currentY);
  currentY += 10;
  
  if (donatedItems.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No items have been donated yet.', 14, currentY);
    currentY += 10;
  } else {
    // Create table data for donated items
    const donatedColumns = [
      { header: 'Item', dataKey: 'name' },
      { header: 'Donated To', dataKey: 'donatedTo' },
      { header: 'Donation Date', dataKey: 'donationDate' },
      { header: 'Value', dataKey: 'value' }
    ];
    
    const donatedData = donatedItems.map(item => ({
      name: item.name,
      donatedTo: item.donatedTo || 'N/A',
      donationDate: item.donationDate ? formatDateSafe(item.donationDate) : 'N/A',
      value: item.value ? `$${item.value.toFixed(2)}` : 'N/A'
    }));
    
    // Add the table to the PDF
    (doc as any).autoTable({
      startY: currentY,
      head: [donatedColumns.map(col => col.header)],
      body: donatedData.map(item => donatedColumns.map(col => item[col.dataKey as keyof typeof item] || 'N/A')),
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      margin: { top: 10, right: 14, bottom: 10, left: 14 }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Add eligible for donation section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Items Eligible for Donation', 14, currentY);
  currentY += 10;
  
  if (eligibleItems.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No items are currently eligible for donation.', 14, currentY);
  } else {
    // Create table data for eligible items
    const eligibleColumns = [
      { header: 'Item', dataKey: 'name' },
      { header: 'Category', dataKey: 'category' },
      { header: 'Found Date', dataKey: 'foundDate' },
      { header: 'Days in Storage', dataKey: 'daysInStorage' }
    ];
    
    const eligibleData = eligibleItems.map(item => {
      const foundDate = item.foundDate ? new Date(item.foundDate) : null;
      const daysInStorage = foundDate 
        ? Math.floor((new Date().getTime() - foundDate.getTime()) / (24 * 60 * 60 * 1000)) 
        : 'N/A';
      
      return {
        name: item.name,
        category: item.category || 'N/A',
        foundDate: foundDate ? formatDateSafe(foundDate) : 'N/A',
        daysInStorage: typeof daysInStorage === 'number' ? daysInStorage.toString() : daysInStorage
      };
    });
    
    // Add the table to the PDF
    (doc as any).autoTable({
      startY: currentY,
      head: [eligibleColumns.map(col => col.header)],
      body: eligibleData.map(item => eligibleColumns.map(col => item[col.dataKey as keyof typeof item] || 'N/A')),
      theme: 'grid',
      headStyles: {
        fillColor: [26, 188, 156], // Different color for eligible items
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      margin: { top: 10, right: 14, bottom: 10, left: 14 }
    });
  }
};

// Generate a claimed items report
const generateClaimedItemsReport = async (doc: jsPDF, items: Item[], startY: number) => {
  console.log('Generating claimed items report');
  
  // Filter items that have been claimed
  const claimedItems = items.filter(item => item.status === 'claimed');
  
  let currentY = startY;
  
  // Add claimed items section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Claimed Items', 14, currentY);
  currentY += 10;
  
  if (claimedItems.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No items have been claimed yet.', 14, currentY);
    currentY += 10;
  } else {
    // Create table data for claimed items with additional info
    const claimedColumns = [
      { header: 'Item', dataKey: 'name' },
      { header: 'Claimed By', dataKey: 'claimedBy' },
      { header: 'Claim Date', dataKey: 'claimDate' },
      { header: 'Found Date', dataKey: 'foundDate' },
      { header: 'Claimed After', dataKey: 'daysToClaimDisplay' }
    ];
    
    const claimedData = claimedItems.map(item => {
      const foundDate = item.foundDate ? new Date(item.foundDate) : null;
      const claimDate = item.claimedDate ? new Date(item.claimedDate) : null;
      
      let daysToClaimDisplay = 'N/A';
      
      if (foundDate && claimDate) {
        const daysToClaimValue = Math.floor(
          (claimDate.getTime() - foundDate.getTime()) / (24 * 60 * 60 * 1000)
        );
        daysToClaimDisplay = `${daysToClaimValue} days`;
      }
      
      return {
        name: item.name,
        claimedBy: typeof item.claimedBy === 'object' ? item.claimedBy?.name || 'N/A' : item.claimedBy || 'N/A',
        claimDate: claimDate ? formatDateSafe(claimDate) : 'N/A',
        foundDate: foundDate ? formatDateSafe(foundDate) : 'N/A',
        daysToClaimDisplay
      };
    });
    
    // Add the table to the PDF with a more efficient chunk-based approach for large datasets
    const CHUNK_SIZE = 100;
    const chunkCount = Math.ceil(claimedData.length / CHUNK_SIZE);
    
    for (let i = 0; i < chunkCount; i++) {
      const chunk = claimedData.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      
      (doc as any).autoTable({
        startY: i === 0 ? currentY : (doc as any).lastAutoTable.finalY + 5,
        head: i === 0 ? [claimedColumns.map(col => col.header)] : [],
        body: chunk.map(item => claimedColumns.map(col => item[col.dataKey as keyof typeof item] || 'N/A')),
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        margin: { top: 10, right: 14, bottom: 10, left: 14 }
      });
      
      // Yield to main thread to prevent UI blocking for large reports
      if (i < chunkCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  }
};

// Add new function for generating donation certificates
const generateDonationCertificate = (doc: jsPDF, options: ReportOptions) => {
  if (!options.certificateData) return;
  
  const { itemName, itemId, organization, contactPerson, donationDate } = options.certificateData;
  
  // Set up the document
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Certificate of Donation', doc.internal.pageSize.width / 2, 40, { align: 'center' });
  
  // Add school logo/header if available
  // doc.addImage('path/to/logo.png', 'PNG', 20, 20, 40, 40);
  
  // Certificate content
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const content = [
    'This is to certify that',
    '',
    organization,
    'represented by',
    contactPerson,
    '',
    'has received the following item as a donation from',
    'De La Salle Lipa Lost and Found Management System:',
    '',
    `Item: ${itemName}`,
    `Item ID: ${itemId}`,
    `Date of Donation: ${formatDate(donationDate)}`,
    '',
    'This item was donated in accordance with the institution\'s',
    'lost and found policies after being unclaimed for more than three months.',
    '',
    'This certificate serves as proof of transfer of ownership',
    'of the above-mentioned item to the receiving organization.',
  ];
  
  let y = 80;
  content.forEach(line => {
    doc.text(line, doc.internal.pageSize.width / 2, y, { align: 'center' });
    y += line ? 10 : 20; // Add more space for empty lines
  });
  
  // Signature lines
  y += 20;
  const lineWidth = 80;
  const startX = (doc.internal.pageSize.width - lineWidth) / 2;
  
  // First signature line
  doc.line(startX, y + 20, startX + lineWidth, y + 20);
  doc.setFontSize(10);
  doc.text('LFIMS Administrator', startX + lineWidth / 2, y + 30, { align: 'center' });
  
  // Second signature line
  y += 50;
  doc.line(startX, y + 20, startX + lineWidth, y + 20);
  doc.text('Recipient\'s Signature', startX + lineWidth / 2, y + 30, { align: 'center' });
  
  // Footer
  doc.setFontSize(8);
  doc.text(
    `Generated on ${formatDate(new Date())}`,
    doc.internal.pageSize.width / 2,
    doc.internal.pageSize.height - 20,
    { align: 'center' }
  );
}; 