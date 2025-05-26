export type ItemType = 'book' | 'electronics' | 'clothing' | 'accessory' | 'document' | 'stationery' | 'jewelry' | 'bag' | 'id_card' | 'key' | 'wallet' | 'money' | 'other';
export type ItemStatus = 'missing' | 'in_custody' | 'claimed' | 'donated' | 'deleted';

export interface Person {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  type: 'student' | 'faculty' | 'staff' | 'visitor';
  studentId?: string;
  employeeId?: string;
}

export interface Item {
  id?: string;
  _id?: string;
  itemId?: string;
  name: string;
  description?: string;
  type: string;
  category?: string;
  location?: string;
  status: string;
  dateReported?: string | Date;
  dateFound?: string | Date;
  foundDate?: string | Date;
  lostDate?: string | Date;
  reportedBy?: Person | string;
  foundBy?: Person | string;
  claimedBy?: Person | string;
  claimedDate?: string | Date;
  claimDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  notes?: string;
  images?: string[];
  department?: string;
  claimerContact?: string;
  donatedTo?: string;
  donationDate?: string | Date;
  imageUrl?: string;
  brand?: string;
  color?: string;
  foundLocation?: string;
  storageLocation?: string;
  lostLocation?: string;
  serialNumber?: string;
  model?: string;
  identifyingFeatures?: string;
  value?: number;
  contactInfo?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  deletedAt?: Date;
} 