export type AreaUnit = 'sqft' | 'sqm' | 'yard';

export interface PersonInfo {
  name: string;
  address: string;
  mobileNumber: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  transactionNumber?: string;
  value: number;
  balance: number;
  creditedAmount?: number;
  debitedAmount?: number;
}

export interface PlotDetails {
  id: string;
  plotNumber: string;
  privatePlotNumber: string;
  landArea: {
    value: number;
    unit: AreaUnit;
  };
  plotArea: {
    value: number;
    unit: AreaUnit;
  };
  size: {
    length: number;
    width: number;
    unit: AreaUnit;
  };
  status: 'sold' | 'booked' | 'open';
  transactionType?: 'sold' | 'purchased' | 'both';
  possession: boolean;
  miscellaneous: {
    type: 'disputed' | 'normal' | 'optional';
    description?: string;
  };
  dateOfSale: string;
  dateOfPurchase: string;
  sellerInfo: PersonInfo;
  purchaserInfo: PersonInfo;
  sellingDetails: BankDetails;
  purchaseDetails: BankDetails;
  location: {
    gramSabha: string;
    fullAddress: string;
  };
}

export interface LandRecord {
  id: string;
  landNumber: string;
  totalArea: {
    value: number;
    unit: AreaUnit;
  };
  roadArea: {
    value: number;
    unit: AreaUnit;
  };
  plots: PlotDetails[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteVisitRequest {
  id: string;
  plotId: string;
  landId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  requestedDate: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isGuest: boolean;
  registeredAt: string;
}
