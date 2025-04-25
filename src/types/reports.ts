import { Item } from './item';
import { jsPDF } from 'jspdf';
import { DateRange, ReportType as ServiceReportType } from '../services/reportService';

export type ReportType = ServiceReportType | 'itemsDetail' | 'donationReport' | 'custom' | 'itemsList';

export interface ReportFilters {
  categories?: string[];
  locations?: string[];
  statuses?: string[];
}

export interface DonationInfo {
  donorName: string;
  donorContact: string;
  donorAddress?: string;
  itemDescription: string;
  itemValue?: string;
  donationDate: string;
  // Additional fields for eligibility report
  eligibleItems?: Item[];
  totalItems?: number;
  eligibleCount?: number;
  eligibilityDate?: Date;
  daysThreshold?: number;
}

export interface ReportTemplate {
  name: string;
  description: string;
  render: (doc: jsPDF, items: Item[], options: ReportOptions, startY: number) => number;
}

export interface ReportOptions {
  reportType: ReportType;
  title: string;
  items?: Item[];  // Add items to the interface
  dateRange?: DateRange;
  filters?: {
    categories?: string[];
    locations?: string[];
    statuses?: string[];
  };
  orientation?: 'portrait' | 'landscape';
  imageQuality?: 'low' | 'medium' | 'high';
  includeImages?: boolean;
  includeDescription?: boolean;
  donationInfo?: DonationInfo;
  showLogo?: boolean;
  footerText?: string;
  template?: ReportTemplate | string;
  customStyles?: ReportStyles;
}

export interface ReportStyles {
  headerFontSize?: number;
  bodyFontSize?: number;
  titleColor?: [number, number, number];
  headerColor?: [number, number, number];
  accentColor?: [number, number, number];
  pageMargins?: [number, number, number, number]; // [left, top, right, bottom]
}

export interface ReportResult {
  blob: Blob;
  fileName: string;
  pageCount: number;
  generatedAt: Date;
}

export interface ReportRendererProps {
  report: Blob | null;
  title: string;
  loading: boolean;
  error: string | null;
  onClose?: () => void;
  onRefresh?: () => void;
} 