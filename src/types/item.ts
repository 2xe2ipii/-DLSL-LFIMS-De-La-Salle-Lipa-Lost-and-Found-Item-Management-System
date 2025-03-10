export type ItemType = 'book' | 'electronics' | 'clothing' | 'accessory' | 'document' | 'other';
export type ItemStatus = 'lost' | 'found' | 'claimed' | 'donated';

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
  id: string;
  type: ItemType;
  name: string;
  description: string;
  color?: string;
  brand?: string;
  dateReported: Date;
  status: ItemStatus;
  location?: string;
  storageLocation?: string;
  imageUrl?: string;
  reportedBy?: Person;
  claimedBy?: Person;
  claimDate?: Date;
  foundBy?: Person;
  foundDate?: Date;
  foundLocation?: string;
  notes?: string;
} 