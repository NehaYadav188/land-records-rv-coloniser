import { LandRecord, SiteVisitRequest } from '../types';

export const mockLandRecords: LandRecord[] = [
  {
    id: 'land-001',
    landNumber: 'LAND-001',
    totalArea: {
      value: 5000,
      unit: 'sqft'
    },
    roadArea: {
      value: 500,
      unit: 'sqft'
    },
    plots: [
      {
        id: 'plot-001',
        plotNumber: 'PLOT-001-A',
        privatePlotNumber: 'PP-001',
        landArea: {
          value: 2000,
          unit: 'sqft'
        },
        plotArea: {
          value: 1800,
          unit: 'sqft'
        },
        size: {
          length: 40,
          width: 45,
          unit: 'sqft'
        },
        status: 'open',
        possession: true,
        miscellaneous: {
          type: 'normal'
        },
        dateOfSale: '2024-01-15',
        dateOfPurchase: '2024-01-20',
        sellerInfo: {
          name: 'John Doe',
          address: '123 Main St, City',
          mobileNumber: '+1234567890'
        },
        purchaserInfo: {
          name: 'Jane Smith',
          address: '456 Oak Ave, Town',
          mobileNumber: '+0987654321'
        },
        sellingDetails: {
          bankName: 'National Bank',
          accountNumber: 'ACC001',
          transactionNumber: 'TXN001',
          value: 50000,
          balance: 100000,
          creditedAmount: 50000
        },
        purchaseDetails: {
          bankName: 'City Bank',
          accountNumber: 'ACC002',
          transactionNumber: 'TXN002',
          value: 45000,
          balance: 95000,
          debitedAmount: 45000
        },
        location: {
          gramSabha: 'Gram Sabha North',
          fullAddress: 'Near Village Temple, Gram Sabha North'
        }
      },
      {
        id: 'plot-002',
        plotNumber: 'PLOT-001-B',
        privatePlotNumber: 'PP-002',
        landArea: {
          value: 1500,
          unit: 'sqft'
        },
        plotArea: {
          value: 1400,
          unit: 'sqft'
        },
        size: {
          length: 35,
          width: 40,
          unit: 'sqft'
        },
        status: 'booked',
        possession: false,
        miscellaneous: {
          type: 'optional',
          description: 'Near main road access'
        },
        dateOfSale: '2024-02-10',
        dateOfPurchase: '2024-02-15',
        sellerInfo: {
          name: 'Robert Johnson',
          address: '789 Pine Rd, Village',
          mobileNumber: '+1122334455'
        },
        purchaserInfo: {
          name: 'Mary Williams',
          address: '321 Elm St, City',
          mobileNumber: '+5544332211'
        },
        sellingDetails: {
          bankName: 'State Bank',
          accountNumber: 'ACC003',
          transactionNumber: 'TXN003',
          value: 40000,
          balance: 80000,
          creditedAmount: 40000
        },
        purchaseDetails: {
          bankName: 'Regional Bank',
          accountNumber: 'ACC004',
          transactionNumber: 'TXN004',
          value: 38000,
          balance: 78000,
          debitedAmount: 38000
        },
        location: {
          gramSabha: 'Gram Sabha South',
          fullAddress: 'Opposite School, Gram Sabha South'
        }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 'land-002',
    landNumber: 'LAND-002',
    totalArea: {
      value: 7500,
      unit: 'sqft'
    },
    roadArea: {
      value: 750,
      unit: 'sqft'
    },
    plots: [
      {
        id: 'plot-003',
        plotNumber: 'PLOT-002-A',
        privatePlotNumber: 'PP-003',
        landArea: {
          value: 3000,
          unit: 'sqft'
        },
        plotArea: {
          value: 2800,
          unit: 'sqft'
        },
        size: {
          length: 50,
          width: 56,
          unit: 'sqft'
        },
        status: 'sold',
        possession: true,
        miscellaneous: {
          type: 'normal'
        },
        dateOfSale: '2024-02-10',
        dateOfPurchase: '2024-02-15',
        sellerInfo: {
          name: 'Robert Johnson',
          address: '789 Pine St, City',
          mobileNumber: '+1122334455'
        },
        purchaserInfo: {
          name: 'Alice Brown',
          address: '321 Maple Rd, Town',
          mobileNumber: '+5544332211'
        },
        sellingDetails: {
          bankName: 'State Bank',
          accountNumber: 'ACC003',
          transactionNumber: 'TXN003',
          value: 75000,
          balance: 0,
          creditedAmount: 75000
        },
        purchaseDetails: {
          bankName: 'State Bank',
          accountNumber: 'ACC004',
          transactionNumber: 'TXN004',
          value: 75000,
          balance: 0,
          debitedAmount: 75000
        },
        location: {
          gramSabha: 'Gram Sabha South',
          fullAddress: 'Next to School, Gram Sabha South'
        }
      }
    ],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-20T00:00:00Z'
  }
];

export const mockSiteVisitRequests: SiteVisitRequest[] = [
  {
    id: 'visit-001',
    plotId: 'plot-001',
    landId: 'land-001',
    userName: 'Guest User',
    userEmail: 'guest@example.com',
    userPhone: '+1234567890',
    requestedDate: '2024-03-15',
    message: 'Interested in visiting the property',
    status: 'pending'
  }
];
