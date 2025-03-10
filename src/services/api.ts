import { 
  Dealer, 
  Inspection, 
  InspectionStatus, 
  TradeRequest,
  RequestStatus,
  TradeType,
  InvoiceStatus,
  SaleType
} from "@/types";

// Initialize local storage if not already set up
const initializeLocalStorage = () => {
  // Check if dealers exist in localStorage
  if (!localStorage.getItem('dealers')) {
    // Add some sample dealers if none exist
    const sampleDealers: Dealer[] = [
      {
        id: 'dealer-1',
        name: 'Metro Motors',
        address: '123 Main Street',
        city: 'Toronto',
        province: 'ON',
        contactPerson: 'John Smith',
        phone: '(416) 555-1234',
        email: 'info@metromotors.com',
        activeSince: new Date('2020-01-15'),
        status: 'Active'
      },
      {
        id: 'dealer-2',
        name: 'Vancouver Auto Gallery',
        address: '456 West Boulevard',
        city: 'Vancouver',
        province: 'BC',
        contactPerson: 'Sarah Chen',
        phone: '(604) 555-6789',
        email: 'sales@vanauto.com',
        activeSince: new Date('2019-06-22'),
        status: 'Active'
      },
      {
        id: 'dealer-3',
        name: 'Prairies Vehicles',
        address: '789 Alberta Drive',
        city: 'Calgary',
        province: 'AB',
        contactPerson: 'Mike Johnson',
        phone: '(403) 555-4321',
        email: 'mike@prairiesvehicles.com',
        activeSince: new Date('2021-03-10'),
        status: 'Inactive'
      }
    ];
    localStorage.setItem('dealers', JSON.stringify(sampleDealers));
  }
  
  // Check if trade requests exist in localStorage
  if (!localStorage.getItem('tradeRequests')) {
    localStorage.setItem('tradeRequests', JSON.stringify([]));
  }
  
  // Check if inspections exist in localStorage
  if (!localStorage.getItem('inspections')) {
    localStorage.setItem('inspections', JSON.stringify([]));
  }
};

// Helper functions to work with localStorage
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Access functions for each data type
const getDealersFromStorage = (): Dealer[] => getFromStorage<Dealer>('dealers');
const saveDealersToStorage = (dealers: Dealer[]): void => saveToStorage('dealers', dealers);

const getTradeRequestsFromStorage = (): TradeRequest[] => {
  const requests = getFromStorage<TradeRequest>('tradeRequests');
  // Ensure dates are properly converted to Date objects
  return requests.map(request => ({
    ...request,
    createdAt: new Date(request.createdAt),
    updatedAt: new Date(request.updatedAt),
    approvalDate: request.approvalDate ? new Date(request.approvalDate) : undefined,
    completionDate: request.completionDate ? new Date(request.completionDate) : undefined,
    inspection: {
      ...request.inspection,
      completedAt: new Date(request.inspection.completedAt),
      fawReviewedAt: request.inspection.fawReviewedAt ? new Date(request.inspection.fawReviewedAt) : undefined,
      baReceivedAt: request.inspection.baReceivedAt ? new Date(request.inspection.baReceivedAt) : undefined,
      baReviewedAt: request.inspection.baReviewedAt ? new Date(request.inspection.baReviewedAt) : undefined,
      consignedAt: request.inspection.consignedAt ? new Date(request.inspection.consignedAt) : undefined,
    },
    invoiceDetails: request.invoiceDetails ? {
      ...request.invoiceDetails,
      requestedAt: request.invoiceDetails.requestedAt ? new Date(request.invoiceDetails.requestedAt) : undefined,
      paidAt: request.invoiceDetails.paidAt ? new Date(request.invoiceDetails.paidAt) : undefined,
      documentsReceivedAt: request.invoiceDetails.documentsReceivedAt ? new Date(request.invoiceDetails.documentsReceivedAt) : undefined,
    } : undefined
  }));
};
const saveTradeRequestsToStorage = (requests: TradeRequest[]): void => saveToStorage('tradeRequests', requests);

const getInspectionsFromStorage = (): Inspection[] => getFromStorage<Inspection>('inspections');
const saveInspectionsToStorage = (inspections: Inspection[]): void => saveToStorage('inspections', inspections);

// Initialize on load
initializeLocalStorage();

// Dealers API
export const getDealers = async (): Promise<Dealer[]> => {
  const dealers = getDealersFromStorage();
  console.info("Fetching all dealers, count:", dealers.length);
  // Return a deep copy of the stored dealers data
  return dealers.map(dealer => ({...dealer}));
};

export const getDealerById = async (id: string): Promise<Dealer | null> => {
  // Find the dealer in the stored data
  const dealers = getDealersFromStorage();
  const dealer = dealers.find(d => d.id === id);
  console.info(`Fetching dealer by id ${id}:`, dealer ? "found" : "not found");
  
  if (!dealer) return null;
  
  // Create a copy with properly parsed activeSince date
  const dealerCopy = {
    ...dealer,
    // Convert activeSince to Date object if it's a string
    activeSince: dealer.activeSince ? new Date(dealer.activeSince) : null
  };
  
  return dealerCopy;
};

export const createDealer = async (dealer: Omit<Dealer, "id" | "activeSince">): Promise<Dealer> => {
  // Generate a unique ID and create timestamp
  const id = `dealer-${Date.now()}`;
  const activeSince = new Date();
  
  // Create new dealer with provided data plus generated fields
  const newDealer: Dealer = {
    id,
    ...dealer,
    activeSince,
  };
  
  // Get current dealers, add new one, and save back to storage
  const dealers = getDealersFromStorage();
  dealers.push(newDealer);
  saveDealersToStorage(dealers);
  
  console.info("Created new dealer:", newDealer);
  console.info("Total dealers now:", dealers.length);
  
  // Return a deep copy to prevent reference issues
  return {...newDealer};
};

// Trade Requests API
export const getTradeRequests = async (): Promise<TradeRequest[]> => {
  const requests = getTradeRequestsFromStorage();
  console.info("Fetching all trade requests, count:", requests.length);
  return requests.map(request => ({...request}));
};

export const clearTradeRequests = async (): Promise<void> => {
  // Initialize with an empty array to clear all trade requests
  localStorage.setItem('tradeRequests', JSON.stringify([]));
  console.info("All trade requests have been cleared");
};

export const getTradeRequestById = async (id: string): Promise<TradeRequest | null> => {
  const requests = getTradeRequestsFromStorage();
  const request = requests.find(r => r.id === id);
  console.info(`Fetching trade request by id ${id}:`, request ? "found" : "not found");
  return request ? {...request} : null;
};

export const createTradeRequest = async (request: Partial<TradeRequest>): Promise<TradeRequest> => {
  const id = `request-${Date.now()}`;
  const createdAt = new Date();
  
  // Ensure we have all required fields with defaults if not provided
  const newRequest: TradeRequest = {
    id,
    dealerId: request.dealerId || "",
    dealerName: request.dealerName || "",
    tradeType: request.tradeType || TradeType.TRADE_IN,
    status: request.status || RequestStatus.DRAFT,
    vehicleInfo: request.vehicleInfo || {
      vin: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      regNumber: "",
      mileage: 0,
      color: ""
    },
    inspection: request.inspection || {
      id: `inspection-${Date.now()}`,
      tradeRequestId: id,
      completedBy: "",
      completedAt: createdAt,
      status: InspectionStatus.PENDING,
      items: [],
      photos: [],
      notes: ""
    },
    requestDate: new Date().toISOString(), // Add requestDate
    createdAt,
    updatedAt: createdAt,
  };
  
  // Get current requests, add new one, and save back to storage
  const requests = getTradeRequestsFromStorage();
  requests.push(newRequest);
  saveTradeRequestsToStorage(requests);
  
  console.info("Created new trade request:", newRequest);
  console.info("Total trade requests now:", requests.length);
  
  return {...newRequest};
};

export const getTradeRequestsByDealerId = async (dealerId: string): Promise<TradeRequest[]> => {
  const requests = getTradeRequestsFromStorage();
  const filteredRequests = requests.filter(r => r.dealerId === dealerId);
  console.info(`Fetching trade requests for dealer ${dealerId}, found: ${filteredRequests.length}`);
  return filteredRequests.map(request => ({...request}));
};

export const updateTradeRequest = async (id: string, updates: Partial<TradeRequest>): Promise<TradeRequest> => {
  const requests = getTradeRequestsFromStorage();
  const index = requests.findIndex(r => r.id === id);
  
  if (index === -1) {
    throw new Error(`Trade request with id ${id} not found`);
  }
  
  // Handle nested updates correctly
  const updatedRequest = {
    ...requests[index],
    ...updates,
    // Special handling for nested objects to ensure they are merged correctly
    inspection: updates.inspection ? {
      ...requests[index].inspection,
      ...updates.inspection
    } : requests[index].inspection,
    vehicleInfo: updates.vehicleInfo ? {
      ...requests[index].vehicleInfo,
      ...updates.vehicleInfo
    } : requests[index].vehicleInfo,
    invoiceDetails: updates.invoiceDetails ? {
      ...requests[index].invoiceDetails,
      ...updates.invoiceDetails
    } : requests[index].invoiceDetails,
    updatedAt: new Date()
  };
  
  requests[index] = updatedRequest;
  saveTradeRequestsToStorage(requests);
  
  console.info(`Updated trade request ${id}:`, updatedRequest);
  
  return {...updatedRequest};
};

export const updateInvoiceStatus = async (id: string, status: InvoiceStatus, details?: any): Promise<TradeRequest> => {
  const requests = getTradeRequestsFromStorage();
  const index = requests.findIndex(r => r.id === id);
  
  if (index === -1) {
    throw new Error(`Trade request with id ${id} not found`);
  }
  
  const updatedRequest = {
    ...requests[index],
    invoiceStatus: status,
    invoiceDetails: {
      ...requests[index].invoiceDetails,
      ...details
    },
    updatedAt: new Date()
  };
  
  requests[index] = updatedRequest;
  saveTradeRequestsToStorage(requests);
  
  console.info(`Updated invoice status for trade request ${id} to ${status}`);
  
  return {...updatedRequest};
};

// Inspections API
export const getInspections = async (): Promise<Inspection[]> => {
  const inspections = getInspectionsFromStorage();
  return inspections.map(inspection => ({...inspection}));
};

export const getInspectionById = async (id: string): Promise<Inspection | null> => {
  const inspections = getInspectionsFromStorage();
  const inspection = inspections.find(i => i.id === id);
  return inspection ? {...inspection} : null;
};

export const updateInspectionStatus = async (id: string, status: InspectionStatus): Promise<Inspection> => {
  // First, get all trade requests since inspections are nested inside them
  const requests = getTradeRequestsFromStorage();
  let foundInspection = false;
  let updatedInspection: Inspection | null = null;
  
  // Loop through requests to find and update the inspection
  const updatedRequests = requests.map(request => {
    if (request.inspection && request.inspection.id === id) {
      foundInspection = true;
      
      const now = new Date();
      
      // Create updated inspection with new status
      updatedInspection = {
        ...request.inspection,
        status,
        // Update metadata based on status
        ...(status === InspectionStatus.FAW_APPROVED && {
          fawReviewedBy: 'FAW Reviewer',
          fawReviewedAt: now
        }),
        ...(status === InspectionStatus.FAW_REJECTED && {
          fawReviewedBy: 'FAW Reviewer',
          fawReviewedAt: now
        }),
        ...(status === InspectionStatus.BA_RECEIVED && {
          baReceivedBy: 'BA Used Reviewer',
          baReceivedAt: now
        })
      };
      
      // Update the inspection in the request
      return {
        ...request,
        inspection: updatedInspection,
        // Update request status based on inspection status
        ...(status === InspectionStatus.FAW_APPROVED && {
          status: RequestStatus.APPROVED,
          approvalDate: now
        }),
        ...(status === InspectionStatus.FAW_REJECTED && {
          status: RequestStatus.REJECTED
        }),
        updatedAt: now
      };
    }
    return request;
  });
  
  if (!foundInspection || !updatedInspection) {
    throw new Error(`Inspection with id ${id} not found`);
  }
  
  // Save updated requests back to storage
  saveTradeRequestsToStorage(updatedRequests);
  console.log(`Updated inspection ${id} to status ${status}`);
  
  return updatedInspection;
};

export const getInspectionItems = async (): Promise<any[]> => {
  // This was empty but should return an array with standard inspection items
  // For now, just return an empty array as it's intended behavior
  return [];
};
