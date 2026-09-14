export type Block = {
  id: string;
  name: string;
  variety: string;
  treeCount: number;
  areaAcres: number;
  location: string;
  elevationMeters: number;
};

export type Treatment = {
  id: string;
  blockId: string;
  date: string;
  treeCountOrArea: string;
  productName: string;
  quantity: number;
  dosage: string;
  cost: number;
  targetPest: string;
  weatherAtTime: string;
  isConfirmed: boolean;
  overuseWarning?: string;
  linkedStockTxId?: string;
  linkedExpenseId?: string;
  photoUri?: string;
  aiSuggested?: boolean;
  aiConfidence?: number;
  isDeleted?: boolean;
};

export type StockItem = {
  id: string;
  name: string;
  category: 'Fungicide' | 'Insecticide' | 'Fertilizer' | 'Fuel' | 'Packaging' | 'Tools' | 'Growth Regulator';
  unit: string;
  currentQuantity: number;
  reorderThreshold: number;
  unitCost: number;
  supplier: string;
  expiryDate?: string;
  hazardClass?: 'Red (Extremely Toxic)' | 'Yellow (Highly Toxic)' | 'Blue (Moderately Toxic)' | 'Green (Slightly Toxic)';
  isDeleted?: boolean;
};

export type StockTransaction = {
  id: string;
  itemId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  notes?: string;
  linkedTreatmentId?: string;
  isConfirmed: boolean;
};

export type ExpenseCategory =
  | 'Pesticides & Sprays'
  | 'Fertilizer & Soil'
  | 'Labor'
  | 'Irrigation & Power'
  | 'Equipment & Maintenance'
  | 'Packaging'
  | 'Transport & Logistics'
  | 'Insurance Premiums'
  | 'Admin/Other';

export type Expense = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  linkedTreatmentId?: string;
  receiptUri?: string;
  isDeleted?: boolean;
};

export type Revenue = {
  id: string;
  date: string;
  buyer: string;
  quantitySoldKg: number;
  grade: 'A' | 'B' | 'C';
  pricePerKg: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  harvestBatchId?: string;
  isDeleted?: boolean;
};

export type HarvestBatch = {
  id: string;
  blockId: string;
  dateHarvested: string;
  variety: string;
  gradeA_Kg: number;
  gradeB_Kg: number;
  gradeC_Kg: number;
  totalKg: number;
  suggestedPricePerKg: number;
  status: 'Stored' | 'Listed' | 'Sold';
  notes?: string;
  photoUri?: string;
  isDeleted?: boolean;
};

export type Budget = {
  category: ExpenseCategory;
  seasonalBudget: number;
  spent: number;
};

export type InsurancePolicy = {
  id: string;
  schemeName: string;
  policyNumber: string;
  sumInsured: number;
  premiumPaid: number;
  enrollmentDeadline: string;
  status: 'Active' | 'Claim Filed' | 'Inspection Completed' | 'Claim Settled' | 'Expired';
  claimAmountLogged?: number;
  notes?: string;
};

export type WeatherAlertTier = 1 | 2 | 3;

export type WeatherAlert = {
  id: string;
  tier: WeatherAlertTier;
  title: string;
  message: string;
  confidence: string;
  source: string;
  date: string;
  actionLabel: string;
  actionRoute: string;
  isDismissed: boolean;
};

export type MandiHistoryPoint = {
  day: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
};

export type MandiPrice = {
  id: string;
  mandiName: string;
  state: string;
  variety: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  date: string;
  trend: 'up' | 'down' | 'stable';
  history?: MandiHistoryPoint[];
};

export type FarmerSaleLog = {
  id: string;
  mandi: string;
  date: string;
  grade: 'A' | 'B' | 'C';
  pricePerKg: number;
  buyer: string;
  varianceFromModal: number;
};

export type FestivalDemand = {
  id: string;
  festivalName: string;
  dateWindow: string;
  weeksAway: number;
  demandLevel: 'High' | 'Very High' | 'Peak';
  advisory: string;
  targetGrades: string[];
};

export type DocumentRecord = {
  id: string;
  title: string;
  category: 'Bill/Invoice' | 'Hail Damage Photo' | 'Spray Log Sheet' | 'Insurance Claim' | 'Soil Test';
  date: string;
  fileUri?: string;
  extractedDraft?: {
    vendor?: string;
    item?: string;
    quantity?: number;
    amount?: number;
    date?: string;
  };
  isConfirmed: boolean;
  linkedEntityId?: string;
  isDeleted?: boolean;
};

export type HailDamageRecord = {
  id: string;
  blockId: string;
  date: string;
  estimatedDamagePercent: number;
  affectedTrees: number;
  notes: string;
  photoUri?: string;
};

export type OrchardLocation = {
  name: string;
  elevationMeters: number;
  district: string;
  category?: 'Kotkhai Belt' | 'Upper Shimla' | 'Kinnaur & Kullu' | 'Other Regions';
  plusCode?: string;
  pincode?: string;
  coordinates?: string;
  googleMapsUrl?: string;
  chillingZone?: 'High Chill (>2,200m)' | 'Mid Chill (1,800-2,200m)' | 'Valley Bench (<1,800m)';
  description?: string;
};

