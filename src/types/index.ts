
export interface Dealer {
  id: string;
  name: string;
  location?: string; // Keep for backward compatibility
  address: string;
  city: string;
  province: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
  registrationDate?: string; // Keep for backward compatibility
  lastActivityDate?: string; // Keep for backward compatibility
  creditLimit?: number; // Keep for backward compatibility
  approvalDate?: string;
  onApproval?: boolean;
  activeSince: Date;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  vin: string;
  regNumber: string;
  mileage: number;
  color: string;
  engineHours?: number;
}

export enum InspectionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'inProgress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  FAW_APPROVED = 'fawApproved',
  FAW_REJECTED = 'fawRejected',
  BA_INSPECTED = 'baInspected',
  BA_APPROVED = 'baApproved',
  BA_REJECTED = 'baRejected',
  BA_RECEIVED = 'baReceived',
  READY_FOR_SALE = 'readyForSale',
  CONSIGNED = 'consigned'
}

export interface InspectionItem {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'Pass' | 'Fail' | 'Not Checked';
  notes?: string;
  passed?: boolean;
  failurePhoto?: any;
  failurePhotoUrl?: string;
}

export interface Inspection {
  id: string;
  tradeRequestId: string;
  completedBy: string;
  completedAt: Date;
  status: InspectionStatus;
  items: InspectionItem[];
  photos: any[];
  notes: string;
  fawReviewedBy?: string;
  fawReviewedAt?: Date;
  baReceivedBy?: string;
  baReceivedAt?: Date;
  baReviewedBy?: string;
  baReviewedAt?: Date;
  consignedDealerId?: string;
  consignedDealerName?: string;
  consignedAt?: Date;
}

export enum TradeType {
  TRADE_IN = 'Trade-In',
  DEALER_SALE = 'Dealer Sale',
  BUY_BACK = 'Buy Back',
}

export enum SaleType {
  CASH = 'Cash',
  FINANCE = 'Finance',
  DEALER_SALE = 'Dealer Sale',
  CTP = 'CTP',
  CTP_LIVE = 'CTP_LIVE'
}

export enum RequestStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'underReview',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

export interface TradeRequest {
  id: string;
  dealerId: string;
  dealerName: string;
  vehicleInfo: VehicleInfo;
  tradeType: TradeType;
  inspection: Inspection;
  status: RequestStatus;
  requestDate?: string; // Changed from required to optional
  approvalDate?: Date; // Changed from string to Date to match implementation
  completionDate?: Date; // Changed from string to Date
  offerAmount?: number;
  finalAmount?: number;
  notes?: string;
  inspectionItems?: InspectionItem[];
  invoiceStatus?: string;
  invoiceDetails?: InvoiceDetails;
  createdAt: Date;
  updatedAt: Date;
  saleType?: SaleType;
  sellingPrice?: number;
}

export interface DealerAnalytics {
  totalTrades: number;
  approvedTrades: number;
  pendingTrades: number;
  rejectedTrades: number;
  completedTrades: number;
  totalTradeValue: number;
  monthlyTrades: { month: string; count: number }[];
}

export enum InvoiceStatus {
  REQUESTED = 'requested',
  INVOICE_RECEIVED = 'invoiceReceived',
  PAID = 'paid',
  COMPLETED = 'completed',
}

export interface InvoiceDetails {
  requestedAt?: Date;
  requestedBy?: string;
  invoiceNumber?: string;
  amount?: number;
  invoiceReceivedAt?: Date;
  invoiceDocumentUrl?: string;
  paidAt?: Date;
  paymentReference?: string;
  paymentProofUrl?: string;
  documentsReceivedAt?: Date;
}

export enum PhotoCategory {
  EXTERIOR = 'exterior',
  INTERIOR = 'interior',
  ENGINE = 'engine',
  DAMAGE = 'damage',
  DOCUMENTS = 'documents',
  OTHER = 'other',
  VIDEO_WALKAROUND = 'videoWalkaround'
}

export { z } from 'zod';
