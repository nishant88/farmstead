import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Block,
  Treatment,
  StockItem,
  StockTransaction,
  Expense,
  Revenue,
  HarvestBatch,
  InsurancePolicy,
  WeatherAlert,
  MandiPrice,
  FestivalDemand,
  DocumentRecord,
  FarmerSaleLog,
  HailDamageRecord,
  OrchardLocation,
} from '../models/types';
import { ORCHARD_LOCATIONS } from '../constants/locations';

interface AppState {
  // Localization & Location
  language: 'en' | 'hi';
  activeLocation: OrchardLocation;
  
  // State
  blocks: Block[];
  treatments: Treatment[];
  stockItems: StockItem[];
  stockTransactions: StockTransaction[];
  expenses: Expense[];
  revenues: Revenue[];
  harvestBatches: HarvestBatch[];
  insurancePolicies: InsurancePolicy[];
  weatherAlerts: WeatherAlert[];
  mandiPrices: MandiPrice[];
  festivalDemands: FestivalDemand[];
  documents: DocumentRecord[];
  farmerSales: FarmerSaleLog[];
  hailDamageRecords: HailDamageRecord[];
  
  // Orchard Specs
  chillingHoursAccumulated: number;
  chillingHoursTarget: number;
  selectedVarietyForChilling: string;
  lastWeatherRefresh: string;
  lastMandiRefresh: string;
  lastMandiRefreshTimestamp: number;
  mandiAutoSyncEnabled: boolean;
  mandiSyncIntervalMinutes: number;
  mandiPriceAlertActive: boolean;
  mandiPriceAlertMessage: string;
  userPriceTargetPerKg: number;
  isSeeded: boolean;

  // Actions
  setLanguage: (lang: 'en' | 'hi') => void;
  setActiveLocation: (loc: OrchardLocation) => void;
  setSelectedVarietyForChilling: (variety: string, targetHours: number) => void;
  seedData: () => void;
  dismissAlert: (id: string) => void;
  refreshWeatherNow: () => void;
  refreshMandiPrices: () => void;
  toggleMandiAutoSync: () => void;
  setMandiSyncIntervalMinutes: (minutes: number) => void;
  setUserPriceTarget: (price: number) => void;

  // Module 1: Treatments (Full CRUD)
  addTreatment: (treatment: Omit<Treatment, 'id'>) => Treatment;
  updateTreatment: (id: string, partial: Partial<Treatment>) => void;
  confirmTreatment: (id: string) => void;
  deleteTreatment: (id: string) => void;

  // Module 2: Weather & Hail Damage
  logHailDamage: (damage: Omit<HailDamageRecord, 'id'>) => void;

  // Module 3: Stock (Full CRUD)
  addStockItem: (item: Omit<StockItem, 'id'>) => void;
  updateStockItem: (id: string, partial: Partial<StockItem>) => void;
  adjustStockQuantity: (id: string, delta: number, type: 'IN' | 'OUT', notes?: string) => void;
  deleteStockItem: (id: string) => void;

  // Module 4: Finance (Full CRUD)
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, partial: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addRevenue: (revenue: Omit<Revenue, 'id'>) => void;
  updateRevenue: (id: string, partial: Partial<Revenue>) => void;
  deleteRevenue: (id: string) => void;
  recordInsuranceClaim: (policyId: string, amount: number) => void;

  // Module 5: Market Intelligence
  logFarmerMandiSale: (sale: Omit<FarmerSaleLog, 'id'>) => void;

  // Module 6: Documents & OCR (Full CRUD)
  addDocument: (doc: Omit<DocumentRecord, 'id'>) => void;
  confirmDocumentBill: (docId: string) => void;
  deleteDocument: (id: string) => void;

  // Module 7: Listings (Full CRUD)
  addHarvestBatch: (batch: Omit<HarvestBatch, 'id'>) => void;
  updateHarvestBatch: (id: string, partial: Partial<HarvestBatch>) => void;
  updateHarvestStatus: (id: string, status: 'Stored' | 'Listed' | 'Sold') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'en',
      activeLocation: ORCHARD_LOCATIONS[0],
      blocks: [],
      treatments: [],
      stockItems: [],
      stockTransactions: [],
      expenses: [],
      revenues: [],
      harvestBatches: [],
      insurancePolicies: [],
      weatherAlerts: [],
      mandiPrices: [],
      festivalDemands: [],
      documents: [],
      farmerSales: [],
      hailDamageRecords: [],
      chillingHoursAccumulated: 840,
      chillingHoursTarget: 1100,
      selectedVarietyForChilling: 'Royal Delicious (Standard)',
      lastWeatherRefresh: 'Today, 08:45 AM',
      lastMandiRefresh: 'Today, 09:15 AM',
      lastMandiRefreshTimestamp: Date.now(),
      mandiAutoSyncEnabled: true,
      mandiSyncIntervalMinutes: 15,
      mandiPriceAlertActive: false,
      mandiPriceAlertMessage: '',
      userPriceTargetPerKg: 135,
      isSeeded: false,

      setLanguage: (lang) => set(() => ({ language: lang })),
      setActiveLocation: (loc) => set(() => ({ activeLocation: loc })),
      setSelectedVarietyForChilling: (variety, targetHours) =>
        set(() => ({ selectedVarietyForChilling: variety, chillingHoursTarget: targetHours })),
      toggleMandiAutoSync: () =>
        set((state) => ({ mandiAutoSyncEnabled: !state.mandiAutoSyncEnabled })),
      setMandiSyncIntervalMinutes: (minutes) =>
        set(() => ({ mandiSyncIntervalMinutes: minutes })),

      seedData: () => {
        const existingBlocks = get().blocks;
        const hasKotkhai = existingBlocks.some(
          (b) => b.location.toLowerCase().includes('kotkhai') || b.name.toLowerCase().includes('kotkhai')
        );

        if (get().isSeeded && existingBlocks.length > 0) {
          if (!hasKotkhai) {
            set((state) => ({
              blocks: [
                {
                  id: 'b0',
                  name: 'Shahoon Kotkhai Orchard (3HVR+H2C)',
                  variety: 'Royal Delicious & Super Chief Spur',
                  treeCount: 520,
                  areaAcres: 2.4,
                  location: 'Shahoon, Kotkhai, Shimla (171205)',
                  elevationMeters: 2234,
                },
                ...state.blocks,
              ],
            }));
          }
          return;
        }

        set({
          blocks: [
            {
              id: 'b0',
              name: 'Shahoon Kotkhai Orchard (3HVR+H2C)',
              variety: 'Royal Delicious & Super Chief Spur',
              treeCount: 520,
              areaAcres: 2.4,
              location: 'Shahoon, Kotkhai, Shimla (171205)',
              elevationMeters: 2234,
            },
            {
              id: 'b1',
              name: 'Kotgarh Lower Orchard',
              variety: 'Royal Delicious (Standard)',
              treeCount: 750,
              areaAcres: 3.2,
              location: 'Kotgarh, Shimla',
              elevationMeters: 2050,
            },
            {
              id: 'b2',
              name: 'Thanedar High Ridge',
              variety: 'Scarlet Spur / Gala',
              treeCount: 420,
              areaAcres: 1.8,
              location: 'Thanedar, Shimla',
              elevationMeters: 2280,
            },
            {
              id: 'b3',
              name: 'Kumarsain River Bench',
              variety: 'Red Chief & Golden',
              treeCount: 380,
              areaAcres: 1.5,
              location: 'Kumarsain, Shimla',
              elevationMeters: 1750,
            },
          ],

          treatments: [
            {
              id: 't1',
              blockId: 'b1',
              date: '2026-03-08',
              treeCountOrArea: '750 trees',
              productName: 'Captan 50 WP',
              quantity: 4,
              dosage: '250g / 100L water',
              cost: 3400,
              targetPest: 'Apple Scab prevention (Pink Bud)',
              weatherAtTime: 'Clear, 16°C, Calm wind (<6 km/h)',
              isConfirmed: true,
            },
            {
              id: 't2',
              blockId: 'b2',
              date: '2026-03-12',
              treeCountOrArea: '420 trees',
              productName: 'Horticultural Mineral Oil (HMO)',
              quantity: 20,
              dosage: '2L / 100L water',
              cost: 5800,
              targetPest: 'San Jose Scale & Mite eggs',
              weatherAtTime: 'Overcast, 12°C',
              isConfirmed: true,
            },
          ],

          stockItems: [
            {
              id: 's1',
              name: 'Captan 50 WP',
              category: 'Fungicide',
              unit: 'kg',
              currentQuantity: 12,
              reorderThreshold: 10,
              unitCost: 850,
              supplier: 'Shimla Kisan Kendra',
              expiryDate: '2027-04-30',
              hazardClass: 'Blue (Moderately Toxic)',
            },
            {
              id: 's2',
              name: 'Mancozeb 75 WP (Dithane M-45)',
              category: 'Fungicide',
              unit: 'kg',
              currentQuantity: 8,
              reorderThreshold: 15,
              unitCost: 620,
              supplier: 'Rohru Agro Store',
              expiryDate: '2026-11-15',
              hazardClass: 'Green (Slightly Toxic)',
            },
            {
              id: 's3',
              name: 'Horticultural Mineral Oil (HMO)',
              category: 'Insecticide',
              unit: 'liters',
              currentQuantity: 40,
              reorderThreshold: 20,
              unitCost: 290,
              supplier: 'HP Agro Industries Corp',
              expiryDate: '2028-02-01',
              hazardClass: 'Green (Slightly Toxic)',
            },
            {
              id: 's4',
              name: 'Calcium Nitrate (YaraLiva)',
              category: 'Fertilizer',
              unit: 'kg',
              currentQuantity: 150,
              reorderThreshold: 50,
              unitCost: 65,
              supplier: 'IFFCO Shimla',
              expiryDate: '2029-01-01',
              hazardClass: 'Green (Slightly Toxic)',
            },
            {
              id: 's5',
              name: 'Anti-Hail Netting (Standard 4m x 100m)',
              category: 'Packaging',
              unit: 'rolls',
              currentQuantity: 3,
              reorderThreshold: 5,
              unitCost: 4800,
              supplier: 'Garware Technical Fibres',
            },
          ],

          stockTransactions: [
            {
              id: 'st1',
              itemId: 's1',
              type: 'OUT',
              quantity: 4,
              date: '2026-03-08',
              notes: 'Pink bud spray in Kotgarh Lower',
              isConfirmed: true,
            },
            {
              id: 'st2',
              itemId: 's3',
              type: 'OUT',
              quantity: 20,
              date: '2026-03-12',
              notes: 'Scale treatment Thanedar Ridge',
              isConfirmed: true,
            },
          ],

          expenses: [
            {
              id: 'e1',
              category: 'Pesticides & Sprays',
              amount: 9200,
              date: '2026-03-08',
              description: 'Captan & HMO Pre-bloom stock purchase',
            },
            {
              id: 'e2',
              category: 'Labor',
              amount: 14500,
              date: '2026-02-20',
              description: 'Winter pruning & basin cleaning (7 workers, 4 days)',
            },
            {
              id: 'e3',
              category: 'Fertilizer & Soil',
              amount: 9750,
              date: '2026-03-02',
              description: 'Calcium Nitrate & Boron foliar bag purchase',
            },
            {
              id: 'e4',
              category: 'Insurance Premiums',
              amount: 12400,
              date: '2026-01-15',
              description: 'PMFBY / WBCIS Apple Weather Policy Premium',
            },
          ],

          revenues: [
            {
              id: 'r1',
              date: '2025-10-18',
              buyer: 'Shree Balaji Traders (Azadpur)',
              quantitySoldKg: 3800,
              grade: 'A',
              pricePerKg: 142,
              totalAmount: 539600,
              paymentStatus: 'Paid',
            },
            {
              id: 'r2',
              date: '2025-10-24',
              buyer: 'Kullu Fresh Fruit Mart',
              quantitySoldKg: 2200,
              grade: 'B',
              pricePerKg: 95,
              totalAmount: 209000,
              paymentStatus: 'Paid',
            },
            {
              id: 'r3',
              date: '2025-11-02',
              buyer: 'HPMC Processing Unit (Parwanoo)',
              quantitySoldKg: 1800,
              grade: 'C',
              pricePerKg: 28,
              totalAmount: 50400,
              paymentStatus: 'Paid',
            },
          ],

          harvestBatches: [
            {
              id: 'hb1',
              blockId: 'b1',
              dateHarvested: '2025-10-10',
              variety: 'Royal Delicious',
              gradeA_Kg: 3800,
              gradeB_Kg: 2200,
              gradeC_Kg: 1800,
              totalKg: 7800,
              suggestedPricePerKg: 138,
              status: 'Sold',
              notes: 'Crisp finish, exceptional deep red color, minimal russeting',
            },
            {
              id: 'hb2',
              blockId: 'b2',
              dateHarvested: '2025-09-28',
              variety: 'Gala Early Pick',
              gradeA_Kg: 1900,
              gradeB_Kg: 850,
              gradeC_Kg: 350,
              totalKg: 3100,
              suggestedPricePerKg: 155,
              status: 'Sold',
              notes: 'Targeted Navratri festival rush',
            },
          ],

          insurancePolicies: [
            {
              id: 'ins1',
              schemeName: 'RWBCIS / PMFBY Apple Weather Insurance (HP Govt)',
              policyNumber: 'HP-WBCIS-2026-89421',
              sumInsured: 350000,
              premiumPaid: 12400,
              enrollmentDeadline: '2026-03-31',
              status: 'Active',
              claimAmountLogged: 0,
              notes: 'Covers unseasonal hail from April 1 to June 30, and shortfall of chilling hours.',
            },
          ],

          weatherAlerts: [
            {
              id: 'w1',
              tier: 3,
              title: 'IMD District Nowcast: Hail & Squall Alert',
              message: 'Severe hail & gusty winds (50-60 km/h) forecasted for Shimla/Solan belts in the next 18 hours. Deploy hail nets immediately and delay planned foliar spraying.',
              confidence: 'High (IMD Radar Nowcast)',
              source: 'IMD Shimla Meteorological Centre',
              date: 'Today, 2 hrs ago',
              actionLabel: 'Check Hail Net Coverage',
              actionRoute: 'weather',
              isDismissed: false,
            },
            {
              id: 'w2',
              tier: 1,
              title: 'Seasonal Hailstorm Outlook (Fortnight Ahead)',
              message: 'Elevated hailstorm probability across upper Shimla & Kullu (2,000m+ elevation) due to active Western Disturbances. WBCIS insurance enrollment closes March 31.',
              confidence: 'Probabilistic (IMD Extended Range Forecast)',
              source: 'Agromet Advisory Service (ICAR / Dr YSP UHF Nauni)',
              date: 'This week',
              actionLabel: 'Verify Insurance Deadline',
              actionRoute: 'finance',
              isDismissed: false,
            },
            {
              id: 'w3',
              tier: 2,
              title: 'Short-Range Rain Window (3-5 Days)',
              message: '35mm precipitation expected Sunday-Monday. Ideal spray-safe window closes Saturday afternoon at 14:00.',
              confidence: 'Medium (Numerical Weather Model)',
              source: 'OpenWeather Agro-Grid',
              date: 'Yesterday',
              actionLabel: 'View Safe Spray Window',
              actionRoute: 'weather',
              isDismissed: false,
            },
          ],

          mandiPrices: [
            {
              id: 'mp1',
              mandiName: 'Azadpur (New Delhi)',
              state: 'Delhi (National Reference)',
              variety: 'Royal Delicious (Grade A)',
              minPrice: 9000,
              maxPrice: 17500,
              modalPrice: 13800,
              date: 'Today',
              trend: 'up',
              history: [
                { day: 'Mon', minPrice: 8800, maxPrice: 16500, modalPrice: 12500 },
                { day: 'Tue', minPrice: 8900, maxPrice: 16800, modalPrice: 12900 },
                { day: 'Wed', minPrice: 9100, maxPrice: 17000, modalPrice: 13200 },
                { day: 'Thu', minPrice: 9000, maxPrice: 17200, modalPrice: 13500 },
                { day: 'Fri', minPrice: 9000, maxPrice: 17500, modalPrice: 13800 },
              ],
            },
            {
              id: 'mp2',
              mandiName: 'Bhattakuffer (Shimla)',
              state: 'Himachal Pradesh',
              variety: 'Royal Delicious (Grade A)',
              minPrice: 8500,
              maxPrice: 15200,
              modalPrice: 12200,
              date: 'Today',
              trend: 'stable',
              history: [
                { day: 'Mon', minPrice: 8200, maxPrice: 14800, modalPrice: 12000 },
                { day: 'Tue', minPrice: 8400, maxPrice: 15000, modalPrice: 12100 },
                { day: 'Wed', minPrice: 8500, maxPrice: 15000, modalPrice: 12200 },
                { day: 'Thu', minPrice: 8500, maxPrice: 15200, modalPrice: 12200 },
                { day: 'Fri', minPrice: 8500, maxPrice: 15200, modalPrice: 12200 },
              ],
            },
            {
              id: 'mp3',
              mandiName: 'Dhalli Sub-Mandi (Shimla)',
              state: 'Himachal Pradesh',
              variety: 'Royal Delicious (Grade B)',
              minPrice: 6200,
              maxPrice: 9800,
              modalPrice: 8100,
              date: 'Today',
              trend: 'up',
            },
            {
              id: 'mp4',
              mandiName: 'Narwal (Jammu)',
              state: 'J&K',
              variety: 'Delicious / Kulu Delicious',
              minPrice: 8000,
              maxPrice: 14000,
              modalPrice: 11500,
              date: 'Yesterday',
              trend: 'down',
            },
          ],

          festivalDemands: [
            {
              id: 'f1',
              festivalName: 'Navratri & Dussehra',
              dateWindow: 'Mid October',
              weeksAway: 4,
              demandLevel: 'Very High',
              advisory: 'Early harvest Gala & high-coloring Royal Delicious fetch up to 25% premium in North Indian mandis for temple fasting and gifting baskets.',
              targetGrades: ['Grade A (Super)', 'Grade A (Large)'],
            },
            {
              id: 'f2',
              festivalName: 'Diwali Peak Gift Baskets',
              dateWindow: 'Late October / Early November',
              weeksAway: 6,
              demandLevel: 'Peak',
              advisory: 'Highest annual volume demand in Azadpur and Mumbai. Premium corrugated tray packs (Grade A) with spotless skin trade at modal prices above ₹16,000/quintal.',
              targetGrades: ['Grade A (Export / Fancy)', 'Grade A (Extra Fancy)'],
            },
            {
              id: 'f3',
              festivalName: 'Winter Wedding Season',
              dateWindow: 'November – February',
              weeksAway: 10,
              demandLevel: 'High',
              advisory: 'Sustained catering and gifting demand. Controlled Atmosphere (CA) cold store release timing should be staggered to capture price peaks.',
              targetGrades: ['Grade A', 'Grade B (Uniform size)'],
            },
          ],

          documents: [
            {
              id: 'doc1',
              title: 'Shimla Kisan Kendra - Captan & Boron Invoice',
              category: 'Bill/Invoice',
              date: '2026-03-05',
              isConfirmed: true,
              extractedDraft: {
                vendor: 'Shimla Kisan Kendra (The Mall)',
                item: 'Captan 50 WP (4kg) + Boron 20% (1kg)',
                quantity: 5,
                amount: 4150,
                date: '2026-03-05',
              },
            },
            {
              id: 'doc2',
              title: 'Draft Scan: Rawal Agro Machinery Bill (Power Sprayer Spares)',
              category: 'Bill/Invoice',
              date: '2026-03-12',
              isConfirmed: false,
              extractedDraft: {
                vendor: 'Rawal Agro Spares, Rampur',
                item: 'Sprayer Brass Nozzle & 100m High Pressure Hose',
                quantity: 1,
                amount: 3200,
                date: '2026-03-12',
              },
            },
            {
              id: 'doc3',
              title: 'Kotgarh Lower Block Soil & Leaf Nutrient Report',
              category: 'Soil Test',
              date: '2026-02-10',
              isConfirmed: true,
            },
            {
              id: 'doc4',
              title: 'Hailstorm Inspection Photo - Upper Thanedar Ridge',
              category: 'Hail Damage Photo',
              date: '2025-05-18',
              isConfirmed: true,
            },
          ],

          farmerSales: [
            {
              id: 'fs1',
              mandi: 'Azadpur',
              date: '2025-10-18',
              grade: 'A',
              pricePerKg: 142,
              buyer: 'Shree Balaji Traders',
              varianceFromModal: 4,
            },
            {
              id: 'fs2',
              mandi: 'Bhattakuffer',
              date: '2025-10-24',
              grade: 'B',
              pricePerKg: 95,
              buyer: 'Kullu Fresh Fruit Mart',
              varianceFromModal: -2,
            },
          ],

          hailDamageRecords: [
            {
              id: 'hd1',
              blockId: 'b2',
              date: '2025-05-18',
              estimatedDamagePercent: 35,
              affectedTrees: 280,
              notes: 'Severe pea-sized hail destroyed fruitlets on western slope.',
            },
          ],

          isSeeded: true,
        });
      },

      dismissAlert: (id: string) =>
        set((state) => ({
          weatherAlerts: state.weatherAlerts.map((a) =>
            a.id === id ? { ...a, isDismissed: true } : a
          ),
        })),

      refreshWeatherNow: () =>
        set((state) => ({
          lastWeatherRefresh: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })),

      refreshMandiPrices: () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const nowMs = Date.now();
        const currentTarget = get().userPriceTargetPerKg;

        const currentPrices = get().mandiPrices;
        let basePrices = [...currentPrices];

        // Ensure Gumma & Chhaila terminal (Kotkhai belt) is in the feed
        if (!basePrices.some((m) => m.mandiName.toLowerCase().includes('gumma'))) {
          basePrices.push({
            id: 'mp_gumma',
            mandiName: 'Gumma & Chhaila Terminal (Kotkhai Belt)',
            state: 'Himachal Pradesh (Kotkhai Hub)',
            variety: 'Royal Delicious (Grade A)',
            minPrice: 9200,
            maxPrice: 16800,
            modalPrice: 13600,
            date: 'Today',
            trend: 'up',
            history: [
              { day: 'Mon', minPrice: 9000, maxPrice: 16000, modalPrice: 13000 },
              { day: 'Tue', minPrice: 9100, maxPrice: 16200, modalPrice: 13200 },
              { day: 'Wed', minPrice: 9100, maxPrice: 16400, modalPrice: 13400 },
              { day: 'Thu', minPrice: 9200, maxPrice: 16600, modalPrice: 13500 },
              { day: 'Fri', minPrice: 9200, maxPrice: 16800, modalPrice: 13600 },
            ],
          });
        }

        let alertTriggered = false;
        let alertMsg = '';

        const updatedMandiPrices = basePrices.map((item) => {
          // Semi-random intra-day auction shift between -200 and +350 in steps of 50
          const delta = (Math.floor(Math.random() * 12) - 4) * 50;
          const newModal = Math.max(item.minPrice + 500, item.modalPrice + delta);
          const newMin = Math.max(3000, Math.min(newModal - 800, item.minPrice + Math.floor(delta * 0.4)));
          const newMax = Math.max(newModal + 800, item.maxPrice + Math.floor(delta * 0.7));
          const newTrend: 'up' | 'down' | 'stable' =
            delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable';

          const existingHistory = item.history || [];
          let updatedHistory = existingHistory;
          if (existingHistory.length > 0) {
            updatedHistory = [
              ...existingHistory.slice(1),
              {
                day: '15m Live',
                minPrice: newMin,
                maxPrice: newMax,
                modalPrice: newModal,
              },
            ];
          }

          const pricePerKg = Math.round(newModal / 100);
          if (pricePerKg >= currentTarget) {
            alertTriggered = true;
            alertMsg = `${item.mandiName} reached ₹${pricePerKg}/kg (Target: ₹${currentTarget}/kg)! Strong buyer demand logged at ${timeStr}.`;
          }

          return {
            ...item,
            modalPrice: newModal,
            minPrice: newMin,
            maxPrice: newMax,
            trend: newTrend,
            history: updatedHistory,
            date: `Today (15m Sync ${timeStr})`,
          };
        });

        // Add or update active alert in weatherAlerts if target breached
        let updatedWeatherAlerts = get().weatherAlerts;
        if (alertTriggered) {
          const existingAlertIndex = updatedWeatherAlerts.findIndex((a) => a.id === 'target_price_alert');
          const targetAlert: WeatherAlert = {
            id: 'target_price_alert',
            tier: 1,
            title: '🎯 Target Selling Price Met in Mandi!',
            message: alertMsg,
            confidence: 'Live Agmarknet Auction Feed',
            source: '15-Minute Mandi Intelligence Cron',
            date: `Updated at ${timeStr}`,
            actionLabel: 'Review Mandi Rates',
            actionRoute: 'market',
            isDismissed: false,
          };

          if (existingAlertIndex >= 0) {
            updatedWeatherAlerts = updatedWeatherAlerts.map((a, idx) =>
              idx === existingAlertIndex ? targetAlert : a
            );
          } else {
            updatedWeatherAlerts = [targetAlert, ...updatedWeatherAlerts];
          }
        }

        set({
          mandiPrices: updatedMandiPrices,
          lastMandiRefresh: timeStr,
          lastMandiRefreshTimestamp: nowMs,
          mandiPriceAlertActive: alertTriggered,
          mandiPriceAlertMessage: alertMsg,
          weatherAlerts: updatedWeatherAlerts,
        });
      },

      setUserPriceTarget: (price: number) =>
        set(() => ({ userPriceTargetPerKg: price })),

      // Module 1: Treatments (Full CRUD)
      addTreatment: (treatment) => {
        const id = 't_' + Date.now();
        const newTreatment: Treatment = { ...treatment, id };
        set((state) => ({ treatments: [newTreatment, ...state.treatments] }));
        return newTreatment;
      },

      updateTreatment: (id, partial) =>
        set((state) => ({
          treatments: state.treatments.map((t) => (t.id === id ? { ...t, ...partial } : t)),
        })),

      confirmTreatment: (id: string) =>
        set((state) => {
          const t = state.treatments.find((item) => item.id === id);
          if (!t) return state;

          const stockMatch = state.stockItems.find((s) =>
            s.name.toLowerCase().includes(t.productName.toLowerCase())
          );

          let updatedStock = state.stockItems;
          let updatedTx = state.stockTransactions;
          if (stockMatch) {
            updatedStock = state.stockItems.map((s) =>
              s.id === stockMatch.id
                ? { ...s, currentQuantity: Math.max(0, s.currentQuantity - t.quantity) }
                : s
            );
            updatedTx = [
              {
                id: 'st_' + Date.now(),
                itemId: stockMatch.id,
                type: 'OUT',
                quantity: t.quantity,
                date: t.date,
                linkedTreatmentId: id,
                notes: `Auto stock deduction for treatment in ${t.blockId}`,
                isConfirmed: true,
              },
              ...state.stockTransactions,
            ];
          }

          const newExpense: Expense = {
            id: 'e_' + Date.now(),
            category: 'Pesticides & Sprays',
            amount: t.cost,
            date: t.date,
            description: `Spray: ${t.productName} (${t.quantity} units) for ${t.targetPest}`,
            linkedTreatmentId: id,
          };

          return {
            treatments: state.treatments.map((item) =>
              item.id === id ? { ...item, isConfirmed: true } : item
            ),
            stockItems: updatedStock,
            stockTransactions: updatedTx,
            expenses: [newExpense, ...state.expenses],
          };
        }),

      deleteTreatment: (id: string) =>
        set((state) => ({
          treatments: state.treatments.filter((t) => t.id !== id),
        })),

      // Module 2: Weather & Hail
      logHailDamage: (damage) => {
        const id = 'hd_' + Date.now();
        set((state) => ({
          hailDamageRecords: [{ ...damage, id }, ...state.hailDamageRecords],
        }));
      },

      // Module 3: Stock (Full CRUD)
      addStockItem: (item) => {
        const id = 's_' + Date.now();
        set((state) => ({
          stockItems: [{ ...item, id }, ...state.stockItems],
        }));
      },

      updateStockItem: (id, partial) =>
        set((state) => ({
          stockItems: state.stockItems.map((s) => (s.id === id ? { ...s, ...partial } : s)),
        })),

      adjustStockQuantity: (id: string, delta: number, type: 'IN' | 'OUT', notes?: string) =>
        set((state) => {
          const item = state.stockItems.find((s) => s.id === id);
          if (!item) return state;
          const newQty = type === 'IN' ? item.currentQuantity + delta : Math.max(0, item.currentQuantity - delta);
          const tx: StockTransaction = {
            id: 'st_' + Date.now(),
            itemId: id,
            type,
            quantity: delta,
            date: new Date().toISOString().split('T')[0],
            notes: notes || `Manual ${type} adjustment`,
            isConfirmed: true,
          };
          return {
            stockItems: state.stockItems.map((s) => (s.id === id ? { ...s, currentQuantity: newQty } : s)),
            stockTransactions: [tx, ...state.stockTransactions],
          };
        }),

      deleteStockItem: (id: string) =>
        set((state) => ({
          stockItems: state.stockItems.filter((s) => s.id !== id),
        })),

      // Module 4: Finance (Full CRUD)
      addExpense: (expense) => {
        const id = 'e_' + Date.now();
        set((state) => ({
          expenses: [{ ...expense, id }, ...state.expenses],
        }));
      },

      updateExpense: (id, partial) =>
        set((state) => ({
          expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...partial } : e)),
        })),

      deleteExpense: (id: string) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      addRevenue: (revenue) => {
        const id = 'r_' + Date.now();
        set((state) => ({
          revenues: [{ ...revenue, id }, ...state.revenues],
        }));
      },

      updateRevenue: (id, partial) =>
        set((state) => ({
          revenues: state.revenues.map((r) => (r.id === id ? { ...r, ...partial } : r)),
        })),

      deleteRevenue: (id: string) =>
        set((state) => ({
          revenues: state.revenues.filter((r) => r.id !== id),
        })),

      recordInsuranceClaim: (policyId: string, amount: number) =>
        set((state) => ({
          insurancePolicies: state.insurancePolicies.map((p) =>
            p.id === policyId
              ? {
                  ...p,
                  claimAmountLogged: (p.claimAmountLogged || 0) + amount,
                  status: 'Claim Filed',
                }
              : p
          ),
        })),

      // Module 5: Market Intelligence
      logFarmerMandiSale: (sale) => {
        const id = 'fs_' + Date.now();
        set((state) => ({
          farmerSales: [{ ...sale, id }, ...state.farmerSales],
        }));
      },

      // Module 6: Documents & OCR (Full CRUD)
      addDocument: (doc) => {
        const id = 'doc_' + Date.now();
        set((state) => ({
          documents: [{ ...doc, id }, ...state.documents],
        }));
      },

      confirmDocumentBill: (docId: string) =>
        set((state) => {
          const doc = state.documents.find((d) => d.id === docId);
          if (!doc || !doc.extractedDraft) return state;

          const newExpense: Expense = {
            id: 'e_' + Date.now(),
            category: 'Equipment & Maintenance',
            amount: doc.extractedDraft.amount || 0,
            date: doc.extractedDraft.date || new Date().toISOString().split('T')[0],
            description: `From OCR Bill: ${doc.extractedDraft.vendor} - ${doc.extractedDraft.item}`,
          };

          return {
            documents: state.documents.map((d) => (d.id === docId ? { ...d, isConfirmed: true } : d)),
            expenses: [newExpense, ...state.expenses],
          };
        }),

      deleteDocument: (id: string) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),

      // Module 7: Listings (Full CRUD)
      addHarvestBatch: (batch) => {
        const id = 'hb_' + Date.now();
        set((state) => ({
          harvestBatches: [{ ...batch, id }, ...state.harvestBatches],
        }));
      },

      updateHarvestBatch: (id, partial) =>
        set((state) => ({
          harvestBatches: state.harvestBatches.map((b) => (b.id === id ? { ...b, ...partial } : b)),
        })),

      updateHarvestStatus: (id: string, status: 'Stored' | 'Listed' | 'Sold') =>
        set((state) => ({
          harvestBatches: state.harvestBatches.map((b) => (b.id === id ? { ...b, status } : b)),
        })),
    }),
    {
      name: 'orchard-ledger-storage-v3',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
