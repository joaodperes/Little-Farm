// ============================================================
// GAME DATA – Crops, Upgrades, Market, Growth, Pests, Mastery, Quests, Animals
// ============================================================

export interface CropDef {
  id: string;
  name: string;
  emoji: string;
  growthTimeSec: number;
  seedCost: number;
  baseSellPrice: number;
  xpReward: number;
  stages: string[];
  tier: number;
  requiredLevel: number;
  description: string;
}

// 33 crops across 7 tiers
export const CROPS: Record<string, CropDef> = {
  // ── Tier 1: Starter Basics (Level 1) ──
  turnip: {
    id: "turnip", name: "Bell Pepper", emoji: "🫑",
    growthTimeSec: 120, seedCost: 3, baseSellPrice: 8, xpReward: 2,
    stages: ["🟫", "🌱", "🌿", "🫑"], tier: 1, requiredLevel: 1,
    description: "Crispy and colorful. The fastest cash crop.",
  },
  radish: {
    id: "radish", name: "Radish", emoji: "🫜",
    growthTimeSec: 180, seedCost: 5, baseSellPrice: 14, xpReward: 3,
    stages: ["🟫", "🌱", "🌿", "🫜"], tier: 1, requiredLevel: 1,
    description: "Peppery and quick. A solid starter crop.",
  },
  wheat: {
    id: "wheat", name: "Wheat", emoji: "🌾",
    growthTimeSec: 240, seedCost: 8, baseSellPrice: 20, xpReward: 5,
    stages: ["🟫", "🌱", "🌿", "🌾"], tier: 1, requiredLevel: 1,
    description: "A reliable grain for steady income.",
  },
  // ── Tier 2: Early Garden (Levels 2-3) ──
  cucumber: {
    id: "cucumber", name: "Cucumber", emoji: "🥒",
    growthTimeSec: 360, seedCost: 10, baseSellPrice: 26, xpReward: 7,
    stages: ["🟫", "🌱", "🌿", "🥒"], tier: 2, requiredLevel: 2,
    description: "Cool and refreshing. A bit more patience, better return.",
  },
  leaf_greens: {
    id: "leaf_greens", name: "Leaf Greens", emoji: "🥬",
    growthTimeSec: 480, seedCost: 12, baseSellPrice: 30, xpReward: 9,
    stages: ["🟫", "🌱", "🥬", "🥬"], tier: 2, requiredLevel: 2,
    description: "Healthy greens for the health-conscious farmer.",
  },
  beans: {
    id: "beans", name: "Beans", emoji: "🫘",
    growthTimeSec: 540, seedCost: 12, baseSellPrice: 32, xpReward: 9,
    stages: ["🟫", "🌱", "🌿", "🫘"], tier: 2, requiredLevel: 2,
    description: "Quick-growing legumes. Great for early profit.",
  },
  pea_pod: {
    id: "pea_pod", name: "Pea Pod", emoji: "🫛",
    growthTimeSec: 660, seedCost: 14, baseSellPrice: 38, xpReward: 11,
    stages: ["🟫", "🌱", "🌿", "🫛"], tier: 2, requiredLevel: 2,
    description: "Sweet peas in a pod. Slower but more rewarding.",
  },
  carrot: {
    id: "carrot", name: "Carrot", emoji: "🥕",
    growthTimeSec: 600, seedCost: 15, baseSellPrice: 40, xpReward: 12,
    stages: ["🟫", "🌱", "☘️", "🥕"], tier: 2, requiredLevel: 3,
    description: "Crunchy and profitable. Worth the wait.",
  },
  garlic: {
    id: "garlic", name: "Garlic", emoji: "🧄",
    growthTimeSec: 780, seedCost: 18, baseSellPrice: 50, xpReward: 14,
    stages: ["🟫", "🌱", "🌿", "🧄"], tier: 2, requiredLevel: 3,
    description: "Pungent and valuable. A flavorful investment.",
  },

  // ── Tier 3: Mid Garden (Levels 4-6) ──
  strawberry: {
    id: "strawberry", name: "Strawberry", emoji: "🍓",
    growthTimeSec: 900, seedCost: 25, baseSellPrice: 65, xpReward: 20,
    stages: ["🟫", "🌱", "🌸", "🍓"], tier: 3, requiredLevel: 4,
    description: "Sweet berries with a lovely bloom phase.",
  },
  onion: {
    id: "onion", name: "Onion", emoji: "🧅",
    growthTimeSec: 1100, seedCost: 20, baseSellPrice: 58, xpReward: 17,
    stages: ["🟫", "🌱", "🌿", "🧅"], tier: 3, requiredLevel: 4,
    description: "Layers of flavor, layers of profit.",
  },
  broccoli: {
    id: "broccoli", name: "Broccoli", emoji: "🥦",
    growthTimeSec: 1350, seedCost: 30, baseSellPrice: 82, xpReward: 25,
    stages: ["🟫", "🌱", "🥦", "🥦"], tier: 3, requiredLevel: 5,
    description: "A nutritious powerhouse. Fast-growing for its tier.",
  },
  potato: {
    id: "potato", name: "Potato", emoji: "🥔",
    growthTimeSec: 1500, seedCost: 35, baseSellPrice: 95, xpReward: 30,
    stages: ["🟫", "🌱", "🌿", "🥔"], tier: 3, requiredLevel: 5,
    description: "A hearty tuber. Patient farmers are rewarded.",
  },
  hot_pepper: {
    id: "hot_pepper", name: "Hot Pepper", emoji: "🌶️",
    growthTimeSec: 2100, seedCost: 40, baseSellPrice: 115, xpReward: 36,
    stages: ["🟫", "🌱", "🌿", "🌶️"], tier: 3, requiredLevel: 6,
    description: "Spicy and profitable. Brings the heat to your farm.",
  },
  eggplant: {
    id: "eggplant", name: "Eggplant", emoji: "🍆",
    growthTimeSec: 2700, seedCost: 48, baseSellPrice: 140, xpReward: 42,
    stages: ["🟫", "🌱", "🌿", "🍆"], tier: 3, requiredLevel: 6,
    description: "Deep purple beauty. A slow but lucrative harvest.",
  },

  // ── Tier 4: Mid-Late (Levels 7-10) ──
  tomato: {
    id: "tomato", name: "Tomato", emoji: "🍅",
    growthTimeSec: 3600, seedCost: 60, baseSellPrice: 170, xpReward: 50,
    stages: ["🟫", "🌱", "🌿", "🍅"], tier: 4, requiredLevel: 7,
    description: "Juicy and rewarding. A mid-game staple.",
  },
  peanut: {
    id: "peanut", name: "Peanut", emoji: "🥜",
    growthTimeSec: 5400, seedCost: 78, baseSellPrice: 228, xpReward: 65,
    stages: ["🟫", "🌱", "🌿", "🥜"], tier: 4, requiredLevel: 8,
    description: "Nutty and profitable. Underground earner.",
  },
  corn: {
    id: "corn", name: "Corn", emoji: "🌽",
    growthTimeSec: 7200, seedCost: 100, baseSellPrice: 300, xpReward: 80,
    stages: ["🟫", "🌱", "🌿", "🌽"], tier: 4, requiredLevel: 9,
    description: "Tall and golden. High value, medium wait.",
  },
  mushroom: {
    id: "mushroom", name: "Mushroom", emoji: "🍄‍🟫",
    growthTimeSec: 9000, seedCost: 120, baseSellPrice: 365, xpReward: 98,
    stages: ["🟫", "🌱", "🍄", "🍄‍🟫"], tier: 4, requiredLevel: 10,
    description: "Earthy fungi. Thrives in the dark, rewards in the light.",
  },

  // ── Tier 5: Cash Crops (Levels 11-16) ──
  cotton: {
    id: "cotton", name: "Cotton", emoji: "☁️",
    growthTimeSec: 10800, seedCost: 150, baseSellPrice: 450, xpReward: 120,
    stages: ["🟫", "🌱", "🌼", "☁️"], tier: 5, requiredLevel: 11,
    description: "Fluffy white gold. A patient investment.",
  },
  ginger: {
    id: "ginger", name: "Ginger", emoji: "🫚",
    growthTimeSec: 14400, seedCost: 180, baseSellPrice: 555, xpReward: 148,
    stages: ["🟫", "🌱", "🌿", "🫚"], tier: 5, requiredLevel: 12,
    description: "Spicy root with a kick. A fiery investment.",
  },
  rice: {
    id: "rice", name: "Rice", emoji: "🍚",
    growthTimeSec: 18000, seedCost: 210, baseSellPrice: 680, xpReward: 170,
    stages: ["🟫", "🌱", "🌾", "🍚"], tier: 5, requiredLevel: 13,
    description: "The world's staple grain. Patiently rewarding.",
  },
  sunflower: {
    id: "sunflower", name: "Sunflower", emoji: "🌻",
    growthTimeSec: 21600, seedCost: 250, baseSellPrice: 800, xpReward: 200,
    stages: ["🟫", "🌱", "🌿", "🌻"], tier: 5, requiredLevel: 14,
    description: "Bright and tall. Plant before bed!",
  },
  chestnut: {
    id: "chestnut", name: "Chestnut", emoji: "🌰",
    growthTimeSec: 25200, seedCost: 290, baseSellPrice: 950, xpReward: 238,
    stages: ["🟫", "🌱", "🌿", "🌰"], tier: 5, requiredLevel: 15,
    description: "Roasted or raw, always in demand.",
  },

  // ── Tier 6: Trees & Luxury (Levels 17-28) ──
  pumpkin: {
    id: "pumpkin", name: "Pumpkin", emoji: "🎃",
    growthTimeSec: 28800, seedCost: 400, baseSellPrice: 1300, xpReward: 350,
    stages: ["🟫", "🌱", "🌿", "🎃"], tier: 6, requiredLevel: 17,
    description: "The king of the patch. Overnight earner.",
  },
  grape: {
    id: "grape", name: "Grape", emoji: "🍇",
    growthTimeSec: 43200, seedCost: 600, baseSellPrice: 2000, xpReward: 500,
    stages: ["🟫", "🌱", "🌿", "🍇"], tier: 6, requiredLevel: 20,
    description: "Fine wine starts here. Half a day's wait.",
  },
  avocado: {
    id: "avocado", name: "Avocado", emoji: "🥑",
    growthTimeSec: 64800, seedCost: 850, baseSellPrice: 2950, xpReward: 740,
    stages: ["🟫", "🌱", "🌳", "🥑"], tier: 6, requiredLevel: 22,
    description: "Creamy green gold. Toast's best friend.",
  },
  apple: {
    id: "apple", name: "Apple Tree", emoji: "🍎",
    growthTimeSec: 86400, seedCost: 1000, baseSellPrice: 3500, xpReward: 800,
    stages: ["🟫", "🌱", "🌳", "🍎"], tier: 6, requiredLevel: 24,
    description: "An orchard investment. Harvests in a day.",
  },
  orange: {
    id: "orange", name: "Orange Tree", emoji: "🍊",
    growthTimeSec: 172800, seedCost: 2000, baseSellPrice: 7500, xpReward: 1500,
    stages: ["🟫", "🌱", "🌳", "🍊"], tier: 6, requiredLevel: 28,
    description: "Citrus fortune. Two days of patience.",
  },

  // ── Tier 7: Legendary (Levels 33-45) ──
  truffle: {
    id: "truffle", name: "Truffle", emoji: "🍄",
    growthTimeSec: 259200, seedCost: 4000, baseSellPrice: 16000, xpReward: 3000,
    stages: ["🟫", "🌱", "🌲", "🍄"], tier: 7, requiredLevel: 33,
    description: "Underground treasure. Three days of mystery.",
  },
  saffron: {
    id: "saffron", name: "Saffron", emoji: "🌸",
    growthTimeSec: 432000, seedCost: 8000, baseSellPrice: 35000, xpReward: 6000,
    stages: ["🟫", "🌱", "🌺", "🌸"], tier: 7, requiredLevel: 38,
    description: "The most expensive spice. 5 days of luxury.",
  },
  starfruit: {
    id: "starfruit", name: "Starfruit", emoji: "⭐",
    growthTimeSec: 518400, seedCost: 10000, baseSellPrice: 45000, xpReward: 8000,
    stages: ["🟫", "🌱", "🌴", "⭐"], tier: 7, requiredLevel: 41,
    description: "Exotic tropical gem. 6 days of starlit growth.",
  },
  dragonfruit: {
    id: "dragonfruit", name: "Dragon Fruit", emoji: "🐉",
    growthTimeSec: 604800, seedCost: 15000, baseSellPrice: 70000, xpReward: 12000,
    stages: ["🟫", "🌱", "🌵", "🐉"], tier: 7, requiredLevel: 45,
    description: "Legendary fruit. A full week's dedication.",
  },
};

export const TOTAL_CROP_COUNT = Object.keys(CROPS).length;

export const FARM_COLS = 5;
export const INITIAL_FARM_ROWS = 2;
export const MAX_FARM_ROWS = 12;

// ── Growth & Wither ──

export function effectiveGrowthTime(baseTimeSec: number, speedLevel: number): number {
  const multiplier = 1 - speedLevel * 0.08;
  return Math.max(baseTimeSec * multiplier, baseTimeSec * 0.5);
}

export function getWitherTimeSec(cropType: string, storageLevel: number): number {
  const crop = CROPS[cropType];
  if (!crop) return 300;
  return crop.growthTimeSec * (4 + storageLevel * 2);
}

export function getGrowthProgress(
  plantedAt: Date, cropType: string, now: Date, speedLevel: number = 0
): number {
  const crop = CROPS[cropType];
  if (!crop) return 0;
  const elapsed = (now.getTime() - plantedAt.getTime()) / 1000;
  const effective = effectiveGrowthTime(crop.growthTimeSec, speedLevel);
  return Math.min(1, elapsed / effective);
}

export function getGrowthStage(
  plantedAt: Date, cropType: string, now: Date, speedLevel: number = 0
): number {
  const p = getGrowthProgress(plantedAt, cropType, now, speedLevel);
  if (p >= 1) return 3;
  if (p >= 0.6) return 2;
  if (p >= 0.2) return 1;
  return 0;
}

export function isWithered(
  plantedAt: Date, cropType: string, storageLevel: number, now: Date
): boolean {
  const crop = CROPS[cropType];
  if (!crop) return false;
  const elapsed = (now.getTime() - plantedAt.getTime()) / 1000;
  return elapsed > getWitherTimeSec(cropType, storageLevel);
}

export function getCropEmoji(
  plantedAt: Date, cropType: string, now: Date, speedLevel: number = 0
): string {
  const crop = CROPS[cropType];
  if (!crop) return "🟫";
  const stage = getGrowthStage(plantedAt, cropType, now, speedLevel);
  return crop.stages[stage];
}

// ── XP & Levels ──

export function xpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(1.35, level - 1));
}

// ── Upgrade System ──

export interface UpgradeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  baseCost: number;
  maxLevel: number;
  costFormula: (level: number, farm: { farmRows: number; autoFarmerCount: number }) => number;
  effectDescription: (level: number) => string;
}

export const UPGRADES: Record<string, UpgradeDef> = {
  expand: {
    id: "expand",
    name: "Expand Farm",
    emoji: "📐",
    description: "Add a new row of 5 plots to your farm.",
    baseCost: 150,
    maxLevel: 8,
    costFormula: (_l, farm) => Math.floor(150 * Math.pow(1.7, farm.farmRows - INITIAL_FARM_ROWS)),
    effectDescription: (_l) => "",
  },
  storage: {
    id: "storage",
    name: "Storage House",
    emoji: "🏠",
    description: "Increase wither time and generate medicine to cure pest attacks.",
    baseCost: 100,
    maxLevel: 10,
    costFormula: (level) => Math.floor(100 * Math.pow(1.45, level)),
    effectDescription: (level) => {
      const mult = 4 + level * 2;
      const medCap = level;
      const cooldown = Math.max(600, 1800 - (level - 1) * 120);
      const cooldownMin = Math.floor(cooldown / 60);
      return `Wither: ${mult}× growth | 💊 Medicine: ${medCap} max, +1 every ${cooldownMin}min`;
    },
  },
  pesticide: {
    id: "pesticide",
    name: "Pesticide",
    emoji: "🛡️",
    description: "Reduce the chance of pest attacks on your crops.",
    baseCost: 80,
    maxLevel: 7,
    costFormula: (level) => Math.floor(80 * Math.pow(1.4, level)),
    effectDescription: (level) => {
      const reduction = Math.min(level * 15, 100);
      return `Pest chance reduced by ${reduction}%`;
    },
  },
  speed: {
    id: "speed",
    name: "Speed Boost",
    emoji: "⚡",
    description: "Reduce all crop growth times.",
    baseCost: 200,
    maxLevel: 6,
    costFormula: (level) => Math.floor(200 * Math.pow(1.5, level)),
    effectDescription: (level) => {
      const reduction = Math.min(level * 8, 48);
      return `Growth ${reduction}% faster`;
    },
  },
  autoFarmer: {
    id: "autoFarmer",
    name: "Auto Farmer",
    emoji: "🤖",
    description: "Hire farmers that auto-harvest and replant using seeds from inventory. Each level adds 5 farmers (1 full row of plots). Max level covers your entire farm!",
    baseCost: 500,
    maxLevel: 10,
    costFormula: (_l, farm) => {
      const effectiveLevel = Math.floor(farm.autoFarmerCount / 5);
      return Math.floor(500 * Math.pow(1.6, effectiveLevel));
    },
    effectDescription: (level) => {
      const farmers = level * 5;
      const maxPlots = (INITIAL_FARM_ROWS + 8) * FARM_COLS;
      const pct = Math.min(100, Math.round((farmers / maxPlots) * 100));
      return `${farmers} farmers (${pct}% of max ${maxPlots} plots) · Harvests & replants automatically`;
    },
  },
  autoSeller: {
    id: "autoSeller",
    name: "Auto Seller",
    emoji: "💰",
    description: "Automatically sell harvested crops to fund your auto-farmers. Sells at a capped rate — manual selling during high demand always earns more!",
    baseCost: 200,
    maxLevel: 10,
    costFormula: (level) => Math.floor(200 * Math.pow(1.5, level)),
    effectDescription: (level) => {
      if (level === 0) return "";
      const rate = getAutoSellerRate(level);
      return `Sells ${level + 1} crop${level > 0 ? "s" : ""}/cycle at up to ${rate.toFixed(1)}× rate`;
    },
  },
};

// ── Market System ──

export interface MarketCrop {
  demand: number;
  trend: "up" | "down" | "stable";
}

export type MarketData = Record<string, MarketCrop>;

const MARKET_UPDATE_INTERVAL_SEC = 300;

export function initMarketData(): MarketData {
  const data: MarketData = {};
  for (const id of Object.keys(CROPS)) {
    data[id] = { demand: 1.0, trend: "stable" };
  }
  return data;
}

export function tickMarket(data: MarketData): MarketData {
  const next: MarketData = {};
  for (const [id, crop] of Object.entries(data)) {
    const change = (Math.random() - 0.5) * 0.3;
    const reversion = (1.0 - crop.demand) * 0.08;
    let d = crop.demand + change + reversion;
    d = Math.max(0.3, Math.min(3.0, d));
    d = Math.round(d * 100) / 100;
    const trend: "up" | "down" | "stable" =
      d > crop.demand + 0.04 ? "up" : d < crop.demand - 0.04 ? "down" : "stable";
    next[id] = { demand: d, trend };
  }
  return next;
}

export function shouldTickMarket(lastUpdated: Date, now: Date): boolean {
  return (now.getTime() - lastUpdated.getTime()) / 1000 >= MARKET_UPDATE_INTERVAL_SEC;
}

export function marketTicksToApply(lastUpdated: Date, now: Date): number {
  const sec = (now.getTime() - lastUpdated.getTime()) / 1000;
  return Math.min(Math.floor(sec / MARKET_UPDATE_INTERVAL_SEC), 1000);
}

// ── Pest System ──

const PEST_CHECK_INTERVAL_SEC = 60;
const BASE_PEST_CHANCE_PER_MIN = 0.004;

export function shouldCheckPests(lastCheck: Date, now: Date): boolean {
  return (now.getTime() - lastCheck.getTime()) / 1000 >= PEST_CHECK_INTERVAL_SEC;
}

export function rollPestAttacks(
  growingPlotIds: string[],
  pesticideLevel: number,
  now: Date
): string[] {
  const attacked: string[] = [];
  if (growingPlotIds.length === 0) return attacked;
  const effectiveChance = BASE_PEST_CHANCE_PER_MIN * Math.max(0, 1 - pesticideLevel * 0.15);
  if (effectiveChance <= 0) return attacked;
  const minuteSlot = Math.floor(now.getTime() / 60000);
  for (const plotId of growingPlotIds) {
    const hash = simpleHash(plotId + "|" + minuteSlot);
    if (hash < effectiveChance) attacked.push(plotId);
  }
  return attacked;
}

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return (Math.abs(h) % 10000) / 10000;
}

// ── Medicine System (Storage House) ──

export function getMedicineMaxCapacity(storageLevel: number): number {
  return storageLevel; // Level 0 = 0 (no medicine), level 1 = 1, level 10 = 10
}

export function getMedicineCooldownSec(storageLevel: number): number {
  if (storageLevel === 0) return Infinity; // No medicine generation at level 0
  // Starts at 30min, decreases by 2min per level, minimum 10min
  return Math.max(600, 1800 - (storageLevel - 1) * 120);
}

export function calculateMedicineRefill(
  currentCount: number,
  lastRefill: Date,
  now: Date,
  storageLevel: number
): { newCount: number; lastRefill: Date } {
  const capacity = getMedicineMaxCapacity(storageLevel);
  const cooldown = getMedicineCooldownSec(storageLevel);
  if (capacity === 0 || cooldown === Infinity || currentCount >= capacity) {
    return { newCount: currentCount, lastRefill };
  }
  const elapsed = (now.getTime() - lastRefill.getTime()) / 1000;
  const refillsPossible = Math.floor(elapsed / cooldown);
  const newCount = Math.min(capacity, currentCount + refillsPossible);
  if (newCount > currentCount) {
    // Advance lastRefill by the number of cooldowns that produced refills
    const usedCooldowns = newCount - currentCount;
    const newLastRefill = new Date(lastRefill.getTime() + usedCooldowns * cooldown * 1000);
    return { newCount, lastRefill: newLastRefill };
  }
  return { newCount: currentCount, lastRefill };
}

// ── Offline Auto-Farmer Multi-Cycle Simulation ──

export interface OfflineSimResult {
  finalPlots: { id: string; cropType: string | null; plantedAtMs: number; state: string }[];
  inventoryDeltas: Record<string, number>;
  totalXpGain: number;
  totalHarvested: number;
  harvestByCrop: Record<string, number>;
  totalPlanted: number;
  totalCoinsFromSeller: number;
  totalWithered: number;
  cyclesCompleted: number;
}

interface SimPlot {
  id: string;
  cropType: string | null;
  plantedAtMs: number;
  state: string;
  gen: number;
}

interface SimEvent {
  time: number;
  type: "mature" | "wither";
  plotIdx: number;
  gen: number;
}

function findBestSeed(
  inv: Record<string, number>,
  playerLevel: number,
  preferredCrop: string | null
): string | null {
  if (preferredCrop) {
    const count = inv[`seed_${preferredCrop}`] || 0;
    const crop = CROPS[preferredCrop];
    if (crop && count > 0 && isCropUnlocked(crop, playerLevel)) {
      return preferredCrop;
    }
  }
  let cheapestSeed: string | null = null;
  let cheapestCost = Infinity;
  for (const [id, crop] of Object.entries(CROPS)) {
    if (!isCropUnlocked(crop, playerLevel)) continue;
    const count = inv[`seed_${id}`] || 0;
    if (count > 0 && crop.seedCost < cheapestCost) {
      cheapestCost = crop.seedCost;
      cheapestSeed = id;
    }
  }
  return cheapestSeed;
}

export function simulateOfflineCycles(params: {
  plots: { id: string; cropType: string | null; plantedAt: Date | null; state: string }[];
  inventory: Record<string, number>;
  autoFarmerCount: number;
  autoSellerLevel: number;
  autoSellerCrops: string[];
  marketData: MarketData;
  playerLevel: number;
  speedLevel: number;
  storageLevel: number;
  fromTimeMs: number;
  toTimeMs: number;
  masteryMap: Record<string, number>;
  preferredCrop: string | null;
}): OfflineSimResult {
  const {
    plots, inventory, autoFarmerCount, autoSellerLevel, autoSellerCrops,
    marketData, playerLevel, speedLevel, storageLevel,
    fromTimeMs, toTimeMs, masteryMap, preferredCrop,
  } = params;

  // Clone plots into sim state
  const simPlots: SimPlot[] = plots.map((p) => ({
    id: p.id,
    cropType: p.cropType,
    plantedAtMs: p.plantedAt ? p.plantedAt.getTime() : 0,
    state: p.state,
    gen: 0,
  }));
  const simInv: Record<string, number> = { ...inventory };

  let totalXpGain = 0;
  let totalHarvested = 0;
  const harvestByCrop: Record<string, number> = {};
  let totalPlanted = 0;
  let totalCoinsFromSeller = 0;
  let totalWithered = 0;
  let cyclesCompleted = 0;

  // Build initial maturity/wither events for growing plots
  const events: SimEvent[] = [];
  for (let i = 0; i < simPlots.length; i++) {
    const p = simPlots[i];
    if (!p.cropType || p.state === "empty" || p.state === "withered") continue;
    const crop = CROPS[p.cropType];
    if (!crop) continue;
    const effSec = effectiveGrowthTime(crop.growthTimeSec, speedLevel);
    const witherSec = getWitherTimeSec(p.cropType, storageLevel);
    const matureMs = p.plantedAtMs + effSec * 1000;
    const witherMs = p.plantedAtMs + witherSec * 1000;
    if (p.state === "pest") {
      if (witherMs <= toTimeMs) events.push({ time: witherMs, type: "wither", plotIdx: i, gen: p.gen });
      continue;
    }
    if (matureMs <= toTimeMs) events.push({ time: matureMs, type: "mature", plotIdx: i, gen: p.gen });
    if (witherMs <= toTimeMs) events.push({ time: witherMs, type: "wither", plotIdx: i, gen: p.gen });
  }
  events.sort((a, b) => a.time - b.time);

  const pendingHarvest = new Set<number>();
  let eventIdx = 0;
  const MAX_ITER = 5000;
  let iter = 0;

  while (eventIdx < events.length && iter < MAX_ITER) {
    iter++;
    const currentTime = events[eventIdx].time;
    if (currentTime > toTimeMs) break;

    // Process all events at this timestamp
    while (eventIdx < events.length && events[eventIdx].time <= currentTime) {
      const ev = events[eventIdx];
      const plot = simPlots[ev.plotIdx];

      // Skip stale events from a previous crop generation on this plot
      if (ev.gen !== plot.gen) { eventIdx++; continue; }

      if (ev.type === "mature" && plot.state === "growing") {
        plot.state = "mature";
        pendingHarvest.add(ev.plotIdx);
      } else if (ev.type === "wither") {
        if (plot.state === "growing" || plot.state === "mature") {
          plot.state = "withered";
          totalWithered++;
          pendingHarvest.delete(ev.plotIdx);
        } else if (plot.state === "pest") {
          plot.state = "withered";
          plot.cropType = null;
          plot.plantedAtMs = 0;
          totalWithered++;
        }
      }
      eventIdx++;
    }

    // Auto-farmer: harvest pending mature plots (multiple cycles at same timestamp)
    if (autoFarmerCount > 0 && pendingHarvest.size > 0) {
      let farmerCyclesAtTime = 0;
      while (pendingHarvest.size > 0 && farmerCyclesAtTime < 50) {
        farmerCyclesAtTime++;

        // Clean pending set — remove plots that are no longer mature
        for (const idx of [...pendingHarvest]) {
          if (simPlots[idx].state !== "mature") pendingHarvest.delete(idx);
        }
        if (pendingHarvest.size === 0) break;

        const toHarvest = [...pendingHarvest].slice(0, autoFarmerCount);
        for (const pi of toHarvest) {
          const plot = simPlots[pi];
          if (!plot.cropType) continue;
          const crop = CROPS[plot.cropType];
          if (!crop) continue;
          simInv[`crop_${plot.cropType}`] = (simInv[`crop_${plot.cropType}`] || 0) + 1;
          const ml = getMasteryLevel(masteryMap[plot.cropType] || 0);
          totalXpGain += getCropXpWithMastery(plot.cropType, ml);
          totalHarvested++;
          harvestByCrop[plot.cropType] = (harvestByCrop[plot.cropType] || 0) + 1;
          plot.state = "empty";
          plot.cropType = null;
          plot.plantedAtMs = 0;
          pendingHarvest.delete(pi);
        }
        cyclesCompleted++;

        // Replant empty plots
        let seedToPlant = findBestSeed(simInv, playerLevel, preferredCrop);
        const emptyIndices = simPlots
          .map((p, i) => ({ p, i }))
          .filter((x) => x.p.state === "empty")
          .map((x) => x.i);

        for (const idx of emptyIndices) {
          if (!seedToPlant) break;
          const seedKey = `seed_${seedToPlant}`;
          if ((simInv[seedKey] || 0) <= 0) {
            seedToPlant = findBestSeed(simInv, playerLevel, preferredCrop);
            if (!seedToPlant) break;
            continue;
          }
          simInv[seedKey]--;
          simPlots[idx].cropType = seedToPlant;
          simPlots[idx].plantedAtMs = currentTime;
          simPlots[idx].state = "growing";
          simPlots[idx].gen++;
          totalPlanted++;
          const crop = CROPS[seedToPlant];
          const effSec = effectiveGrowthTime(crop.growthTimeSec, speedLevel);
          const witherSec = getWitherTimeSec(seedToPlant, storageLevel);
          if (currentTime + effSec * 1000 <= toTimeMs) {
            events.push({ time: currentTime + effSec * 1000, type: "mature", plotIdx: idx, gen: simPlots[idx].gen });
          }
          events.push({ time: currentTime + witherSec * 1000, type: "wither", plotIdx: idx, gen: simPlots[idx].gen });
        }

        // Re-sort events and reset index past current time
        events.sort((a, b) => a.time - b.time);
        eventIdx = events.findIndex((e) => e.time > currentTime);
        if (eventIdx < 0) break;

        // Auto-seller per cycle
        if (autoSellerLevel > 0) {
          let sellBudget = autoSellerLevel + 1;
          const cropEntries = Object.entries(simInv)
            .filter(([k, v]) => k.startsWith("crop_") && v > 0)
            .sort((a, b) => {
              const ca = CROPS[a[0].replace("crop_", "")];
              const cb = CROPS[b[0].replace("crop_", "")];
              return (ca?.baseSellPrice ?? 0) - (cb?.baseSellPrice ?? 0);
            });
          for (const [key, qty] of cropEntries) {
            if (sellBudget <= 0) break;
            const cropType = key.replace("crop_", "");
            if (autoSellerCrops.length > 0 && !autoSellerCrops.includes(cropType)) continue;
            const toSell = Math.min(qty, sellBudget);
            const demand = marketData[cropType]?.demand ?? 1;
            const price = getAutoSellerPrice(cropType, demand, autoSellerLevel);
            totalCoinsFromSeller += price * toSell;
            simInv[key] -= toSell;
            sellBudget -= toSell;
          }
        }
      }
    }
  }

  // Compute inventory deltas
  const inventoryDeltas: Record<string, number> = {};
  const allKeys = new Set([...Object.keys(inventory), ...Object.keys(simInv)]);
  for (const key of allKeys) {
    const delta = (simInv[key] || 0) - (inventory[key] || 0);
    if (delta !== 0) inventoryDeltas[key] = delta;
  }

  return {
    finalPlots: simPlots.map((p) => ({
      id: p.id, cropType: p.cropType,
      plantedAtMs: p.plantedAtMs, state: p.state,
    })),
    inventoryDeltas, totalXpGain, totalHarvested, harvestByCrop,
    totalPlanted, totalCoinsFromSeller, totalWithered, cyclesCompleted,
  };
}

// ── Offline Progress ──

export interface OfflineProgress {
  cropsReady: string[];
  cropsWithered: string[];
  pestAttacks: string[];
  totalElapsed: number;
  marketChanges: number;
  autoHarvested?: number;
  autoPlanted?: number;
  autoCoinsEarned?: number;
  autoCycles?: number;
  autoWithered?: number;
}

export function calculateOfflineProgress(
  plots: { cropType: string | null; plantedAt: Date | null; state: string }[],
  lastOnlineAt: Date,
  now: Date,
  storageLevel: number,
  speedLevel: number,
): OfflineProgress {
  const result: OfflineProgress = {
    cropsReady: [],
    cropsWithered: [],
    pestAttacks: [],
    totalElapsed: Math.floor((now.getTime() - lastOnlineAt.getTime()) / 1000),
    marketChanges: marketTicksToApply(lastOnlineAt, now),
  };
  for (const plot of plots) {
    if (!plot.cropType || !plot.plantedAt || plot.state === "empty") continue;
    if (plot.state === "withered") {
      result.cropsWithered.push(plot.cropType);
      continue;
    }
    if (isWithered(plot.plantedAt, plot.cropType, storageLevel, now)) {
      result.cropsWithered.push(plot.cropType);
    } else if (getGrowthProgress(plot.plantedAt, plot.cropType, now, speedLevel) >= 1) {
      result.cropsReady.push(plot.cropType);
    }
  }
  return result;
}

// ── Helpers ──

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (h < 24) return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
}

export function formatElapsed(seconds: number): string {
  return formatDuration(seconds);
}

export function getCropSellPrice(cropType: string, demand: number): number {
  const crop = CROPS[cropType];
  if (!crop) return 0;
  return Math.max(1, Math.floor(crop.baseSellPrice * demand));
}

export function getCropSellPriceWithMastery(cropType: string, demand: number, masteryLevel: number): number {
  const base = getCropSellPrice(cropType, demand);
  const bonus = 1 + masteryLevel * 0.03; // +3% per mastery level
  return Math.max(1, Math.floor(base * bonus));
}

export function getCropXpWithMastery(cropType: string, masteryLevel: number): number {
  const crop = CROPS[cropType];
  if (!crop) return 0;
  const bonus = 1 + masteryLevel * 0.02; // +2% XP per mastery level
  return Math.max(1, Math.floor(crop.xpReward * bonus));
}

// ── Auto Seller ──

export function getAutoSellerRate(level: number): number {
  if (level === 0) return 0;
  return Math.min(0.5 + level * 0.08, 1.3);
}

export function getAutoSellerPrice(cropType: string, demand: number, autoSellerLevel: number): number {
  if (autoSellerLevel === 0) return 0;
  const crop = CROPS[cropType];
  if (!crop) return 0;
  const rate = Math.min(demand, getAutoSellerRate(autoSellerLevel));
  return Math.max(1, Math.floor(crop.baseSellPrice * rate));
}

export function getCropTierLabel(tier: number): string {
  const labels = ["", "Fast", "Steady", "Investment", "Patient", "Long-term", "Epic", "Legendary"];
  return labels[tier] || "";
}

export function getCropTierColor(tier: number): string {
  const colors = ["", "text-green-700", "text-emerald-700", "text-teal-700", "text-amber-700", "text-orange-700", "text-red-700", "text-purple-700"];
  return colors[tier] || "";
}

// ── Level Unlock System ──

export function isCropUnlocked(crop: CropDef, playerLevel: number): boolean {
  return playerLevel >= crop.requiredLevel;
}

export function getNextUnlock(playerLevel: number): CropDef | null {
  const unlocked = (Object.values(CROPS) as CropDef[])
    .filter((c) => !isCropUnlocked(c, playerLevel))
    .sort((a, b) => a.requiredLevel - b.requiredLevel);
  return unlocked[0] ?? null;
}

export function getCropsUnlockedAtLevel(level: number): CropDef[] {
  return (Object.values(CROPS) as CropDef[]).filter((c) => c.requiredLevel === level);
}

export function getLevelBenefits(level: number): string[] {
  const benefits: string[] = [];
  const newCrops = getCropsUnlockedAtLevel(level);
  if (newCrops.length > 0) {
    benefits.push(`Unlock: ${newCrops.map((c) => `${c.emoji} ${c.name}`).join(", ")}`);
  }
  if (level >= 5 && level % 5 === 0) {
    benefits.push("Extra auto-farmer slot unlocked");
  }
  return benefits;
}

// ── Daily Login Bonus (uniform random from unlocked crops only) ──

export interface DailyBonusResult {
  seeds: { cropType: string; crop: CropDef; quantity: number }[];
  coins: number;
}

export function generateDailyBonus(playerLevel: number): DailyBonusResult {
  const unlockedCrops = (Object.values(CROPS) as CropDef[])
    .filter((c) => isCropUnlocked(c, playerLevel));

  if (unlockedCrops.length === 0) {
    return { seeds: [], coins: 10 };
  }

  // Uniform random from unlocked crops only (no weighting)
  const count = 3 + Math.floor(Math.random() * 5) + Math.floor(playerLevel / 10);
  const seeds: DailyBonusResult["seeds"] = [];

  for (let i = 0; i < count; i++) {
    const crop = unlockedCrops[Math.floor(Math.random() * unlockedCrops.length)];
    const existing = seeds.find((s) => s.cropType === crop.id);
    if (existing) {
      existing.quantity++;
    } else {
      seeds.push({ cropType: crop.id, crop, quantity: 1 });
    }
  }

  const coins = Math.min(100, 5 + playerLevel * 2);
  return { seeds, coins };
}

// ── Crop Mastery System ──

export interface MasteryRank {
  name: string;
  emoji: string;
  threshold: number;
  sellBonus: number; // % bonus
  xpBonus: number;   // % bonus
  color: string;     // tailwind color class
}

export const MASTERY_RANKS: MasteryRank[] = [
  { name: "Novice",    emoji: "🌱", threshold: 10,    sellBonus: 3,  xpBonus: 2,  color: "text-green-600" },
  { name: "Apprentice", emoji: "🌿", threshold: 50,    sellBonus: 6,  xpBonus: 4,  color: "text-emerald-600" },
  { name: "Adept",     emoji: "☘️", threshold: 200,   sellBonus: 10, xpBonus: 7,  color: "text-teal-600" },
  { name: "Expert",    emoji: "🌳", threshold: 500,   sellBonus: 15, xpBonus: 10, color: "text-amber-600" },
  { name: "Master",    emoji: "⭐", threshold: 1000,  sellBonus: 21, xpBonus: 14, color: "text-orange-600" },
  { name: "Legendary", emoji: "👑", threshold: 2500,  sellBonus: 28, xpBonus: 20, color: "text-red-600" },
];

export function getMasteryLevel(harvestCount: number): number {
  let level = 0;
  for (let i = MASTERY_RANKS.length - 1; i >= 0; i--) {
    if (harvestCount >= MASTERY_RANKS[i].threshold) {
      level = i + 1;
      break;
    }
  }
  return level;
}

export function getMasteryRank(harvestCount: number): MasteryRank {
  const level = getMasteryLevel(harvestCount);
  return MASTERY_RANKS[level - 1] ?? MASTERY_RANKS[0];
}

export function getNextMasteryRank(harvestCount: number): MasteryRank | null {
  const level = getMasteryLevel(harvestCount);
  return MASTERY_RANKS[level] ?? null;
}

// ── Achievement System ──

export interface AchievementDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: "harvest" | "coins" | "level" | "mastery" | "animals";
  check: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  totalHarvests: number;
  totalCoinsEarned: number;
  level: number;
  masteryLevel6Count: number;
  animalCount: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_harvest", name: "First Harvest", emoji: "🎉", description: "Harvest your first crop", category: "harvest", check: (s) => s.totalHarvests >= 1 },
  { id: "harvest_10", name: "Getting Started", emoji: "🌾", description: "Harvest 10 crops", category: "harvest", check: (s) => s.totalHarvests >= 10 },
  { id: "harvest_100", name: "Seasoned Farmer", emoji: "🧑‍🌾", description: "Harvest 100 crops", category: "harvest", check: (s) => s.totalHarvests >= 100 },
  { id: "harvest_500", name: "Harvest King", emoji: "👑", description: "Harvest 500 crops", category: "harvest", check: (s) => s.totalHarvests >= 500 },
  { id: "harvest_1000", name: "Harvest Legend", emoji: "✨", description: "Harvest 1,000 crops", category: "harvest", check: (s) => s.totalHarvests >= 1000 },
  { id: "earn_100", name: "Pocket Change", emoji: "🪙", description: "Earn 100 coins total", category: "coins", check: (s) => s.totalCoinsEarned >= 100 },
  { id: "earn_1000", name: "Business Blooming", emoji: "💰", description: "Earn 1,000 coins total", category: "coins", check: (s) => s.totalCoinsEarned >= 1000 },
  { id: "earn_10000", name: "Farm Tycoon", emoji: "🏦", description: "Earn 10,000 coins total", category: "coins", check: (s) => s.totalCoinsEarned >= 10000 },
  { id: "earn_100000", name: "Millionaire Farmer", emoji: "💎", description: "Earn 100,000 coins total", category: "coins", check: (s) => s.totalCoinsEarned >= 100000 },
  { id: "level_5", name: "Rising Star", emoji: "⭐", description: "Reach level 5", category: "level", check: (s) => s.level >= 5 },
  { id: "level_15", name: "Experienced", emoji: "🌟", description: "Reach level 15", category: "level", check: (s) => s.level >= 15 },
  { id: "level_30", name: "Veteran", emoji: "💫", description: "Reach level 30", category: "level", check: (s) => s.level >= 30 },
  { id: "level_45", name: "Farm God", emoji: "🏆", description: "Reach level 45", category: "level", check: (s) => s.level >= 45 },
  { id: "master_one", name: "Crop Specialist", emoji: "🥇", description: "Master any crop", category: "mastery", check: (s) => s.masteryLevel6Count >= 1 },
  { id: "master_three", name: "Triple Master", emoji: "🏅", description: "Master 3 different crops", category: "mastery", check: (s) => s.masteryLevel6Count >= 3 },
  { id: "master_all", name: "Grandmaster", emoji: "🏆", description: "Master all crops", category: "mastery", check: (s) => s.masteryLevel6Count >= 33 },
  { id: "first_animal", name: "Animal Friend", emoji: "🐔", description: "Buy your first animal", category: "animals", check: (s) => s.animalCount >= 1 },
  { id: "zoo", name: "Zoo Keeper", emoji: "🦁", description: "Own 8 animals", category: "animals", check: (s) => s.animalCount >= 8 },
];

// ── Quest System ──

export interface QuestDef {
  id: string;
  type: "harvest_any" | "harvest_specific" | "sell_coins" | "plant_seeds" | "earn_xp";
  generateTarget: (level: number) => number;
  description: (target: number, cropName?: string) => string;
  rewardCoins: (level: number) => number;
  rewardXp: (level: number) => number;
  rewardSeedChance: number; // 0-1, chance to also reward a seed
}

export const QUEST_TEMPLATES: QuestDef[] = [
  {
    id: "harvest_any",
    type: "harvest_any",
    generateTarget: (level) => 5 + Math.floor(level * 1.5) + Math.floor(Math.random() * 5),
    description: (target) => `Harvest ${target} crops`,
    rewardCoins: (level) => 10 + level * 5,
    rewardXp: (level) => 5 + level * 3,
    rewardSeedChance: 0.3,
  },
  {
    id: "harvest_specific",
    type: "harvest_specific",
    generateTarget: (level) => 3 + Math.floor(level * 0.8) + Math.floor(Math.random() * 3),
    description: (target, cropName) => `Harvest ${target} ${cropName ?? "crops"}`,
    rewardCoins: (level) => 15 + level * 8,
    rewardXp: (level) => 8 + level * 4,
    rewardSeedChance: 0.5,
  },
  {
    id: "sell_coins",
    type: "sell_coins",
    generateTarget: (level) => 50 + level * 30 + Math.floor(Math.random() * 50),
    description: (target) => `Earn ${target} coins from selling`,
    rewardCoins: (level) => 20 + level * 10,
    rewardXp: (level) => 10 + level * 5,
    rewardSeedChance: 0.2,
  },
  {
    id: "plant_seeds",
    type: "plant_seeds",
    generateTarget: (level) => 5 + Math.floor(level * 1.2) + Math.floor(Math.random() * 5),
    description: (target) => `Plant ${target} seeds`,
    rewardCoins: (level) => 8 + level * 4,
    rewardXp: (level) => 3 + level * 2,
    rewardSeedChance: 0.4,
  },
  {
    id: "earn_xp",
    type: "earn_xp",
    generateTarget: (level) => 20 + level * 15 + Math.floor(Math.random() * 20),
    description: (target) => `Earn ${target} XP`,
    rewardCoins: (level) => 12 + level * 6,
    rewardXp: (level) => 15 + level * 8,
    rewardSeedChance: 0.25,
  },
];

export interface Quest {
  id: string;
  type: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: { coins: number; xp: number; seedCropType?: string; seedQuantity?: number };
  description: string;
  cropType?: string;
}

export function generateDailyQuests(playerLevel: number): Quest[] {
  const unlockedCropIds = Object.values(CROPS)
    .filter((c) => isCropUnlocked(c, playerLevel))
    .map((c) => c.id);

  const quests: Quest[] = [];
  const usedTypes = new Set<string>();

  // Pick 3 unique quest types
  const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  for (const template of shuffled) {
    if (usedTypes.size >= 3) break;
    if (usedTypes.has(template.type)) continue;
    // Skip harvest_specific if no crops unlocked
    if (template.type === "harvest_specific" && unlockedCropIds.length === 0) continue;
    usedTypes.add(template.type);

    const target = template.generateTarget(playerLevel);
    let cropType: string | undefined;
    let description: string;

    if (template.type === "harvest_specific") {
      cropType = unlockedCropIds[Math.floor(Math.random() * unlockedCropIds.length)];
      description = template.description(target, CROPS[cropType]?.name);
    } else {
      description = template.description(target);
    }

    const reward: Quest["reward"] = {
      coins: template.rewardCoins(playerLevel),
      xp: template.rewardXp(playerLevel),
    };

    // Random seed reward
    if (Math.random() < template.rewardSeedChance && unlockedCropIds.length > 0) {
      const seedCrop = unlockedCropIds[Math.floor(Math.random() * unlockedCropIds.length)];
      reward.seedCropType = seedCrop;
      reward.seedQuantity = 1 + Math.floor(Math.random() * 3);
    }

    quests.push({
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: template.type,
      target,
      progress: 0,
      completed: false,
      claimed: false,
      reward,
      description,
      cropType,
    });
  }

  return quests;
}

// ── Farm Animals System ──

export interface AnimalDef {
  id: string;
  name: string;
  emoji: string;
  productEmoji: string;
  productName: string;
  productSellPrice: number;
  productionTimeSec: number;
  cost: number;
  requiredLevel: number;
  maxPerFarm: number;
  description: string;
  feedCrop: string; // which crop to feed for 2× production
  feedMultiplier: number;
}

export const ANIMALS: Record<string, AnimalDef> = {
  chicken: {
    id: "chicken", name: "Chicken", emoji: "🐔",
    productEmoji: "🥚", productName: "Egg",
    productSellPrice: 15, productionTimeSec: 600,
    cost: 500, requiredLevel: 46, maxPerFarm: 6,
    description: "Endgame livestock. Lays eggs every 10 min. Feed wheat for double output!",
    feedCrop: "wheat", feedMultiplier: 2,
  },
  cow: {
    id: "cow", name: "Cow", emoji: "🐄",
    productEmoji: "🥛", productName: "Milk",
    productSellPrice: 50, productionTimeSec: 1800,
    cost: 2000, requiredLevel: 50, maxPerFarm: 4,
    description: "Endgame livestock. Produces milk every 30 min. Feed potato for double output!",
    feedCrop: "potato", feedMultiplier: 2,
  },
  sheep: {
    id: "sheep", name: "Sheep", emoji: "🐑",
    productEmoji: "🧶", productName: "Wool",
    productSellPrice: 120, productionTimeSec: 3600,
    cost: 5000, requiredLevel: 55, maxPerFarm: 3,
    description: "Endgame livestock. Produces wool every hour. Feed cotton for double output!",
    feedCrop: "cotton", feedMultiplier: 2,
  },
  pig: {
    id: "pig", name: "Pig", emoji: "🐷",
    productEmoji: "🍖", productName: "Truffle",
    productSellPrice: 350, productionTimeSec: 7200,
    cost: 15000, requiredLevel: 60, maxPerFarm: 2,
    description: "Endgame livestock. Finds truffles every 2 hours. Feed pumpkin for double output!",
    feedCrop: "pumpkin", feedMultiplier: 2,
  },
};

export function getAnimalProductsReady(animalType: string, lastCollectedAt: Date, fedAt: Date | null, now: Date): number {
  const def = ANIMALS[animalType];
  if (!def) return 0;
  const elapsed = (now.getTime() - lastCollectedAt.getTime()) / 1000;
  const prodTime = fedAt && fedAt > lastCollectedAt
    ? def.productionTimeSec / def.feedMultiplier
    : def.productionTimeSec;
  return Math.floor(elapsed / prodTime);
}

export function getAnimalNextProductTime(animalType: string, lastCollectedAt: Date, fedAt: Date | null, now: Date): number {
  const def = ANIMALS[animalType];
  if (!def) return 0;
  const elapsed = (now.getTime() - lastCollectedAt.getTime()) / 1000;
  const prodTime = fedAt && fedAt > lastCollectedAt
    ? def.productionTimeSec / def.feedMultiplier
    : def.productionTimeSec;
  const nextIn = prodTime - (elapsed % prodTime);
  return Math.max(0, nextIn);
}

// ── Special Traders System ──

export interface SpecialTrader {
  id: string;
  name: string;
  emoji: string;
  flavorText: string;
  items: { cropType: string; quantity: number }[];
  totalReward: number;
  premiumRate: number; // e.g. 1.4 = 40% above market base price
  fulfilled: boolean;
}

const TRADER_NAMES = [
  { name: "Traveling Merchant", emoji: "🧳", texts: ["Seeking fresh produce for distant lands!", "My caravan departs at dawn!", "I pay premium for the right goods!"] },
  { name: "Royal Chef", emoji: "👨‍🍳", texts: ["The banquet requires specific ingredients!", "Only the finest for His Majesty!", "I need exact quantities—no more, no less!"] },
  { name: "Potion Brewer", emoji: "🧙", texts: ["These reagents must be precise!", "My potions require exact measurements!", "Quality ingredients for quality potions!"] },
  { name: "Baker", emoji: "🧑‍🍳", texts: ["I need the right flour and fillings!", "My pastries require precision!", "Wholesome crops for wholesome bread!"] },
  { name: "Merchant Guild", emoji: "🏛️", texts: ["A bulk order from the capital!", "Fulfill this contract for guild favor!", "Our buyers await these exact goods!"] },
  { name: "Wandering Alchemist", emoji: "⚗️", texts: ["I require specific botanical samples!", "My experiments need precise amounts!", "Rare crops for rare results!"] },
  { name: "Feast Organizer", emoji: "🎭", texts: ["The festival demands specific produce!", "Every dish needs its key ingredient!", "Help me make this feast unforgettable!"] },
];

export function generateSpecialTraders(playerLevel: number): SpecialTrader[] {
  const unlockedCropIds = Object.values(CROPS)
    .filter((c) => isCropUnlocked(c, playerLevel))
    .map((c) => c.id);

  if (unlockedCropIds.length === 0) return [];

  // Number of traders: 2 at low levels, 3 at mid, 4 at high
  const traderCount = playerLevel < 10 ? 2 : playerLevel < 25 ? 3 : 4;
  const traders: SpecialTrader[] = [];
  const usedNames = new Set<number>();

  for (let t = 0; t < traderCount; t++) {
    // Pick unique trader persona
    let nameIdx: number;
    do {
      nameIdx = Math.floor(Math.random() * TRADER_NAMES.length);
    } while (usedNames.has(nameIdx) && usedNames.size < TRADER_NAMES.length);
    usedNames.add(nameIdx);
    const persona = TRADER_NAMES[nameIdx];

    // Generate 1-3 item requirements (more at higher levels)
    const itemCount = playerLevel < 8 ? 1 : playerLevel < 20 ? Math.random() < 0.6 ? 2 : 1 : Math.random() < 0.4 ? 3 : 2;
    const shuffledCrops = [...unlockedCropIds].sort(() => Math.random() - 0.5);
    const items: { cropType: string; quantity: number }[] = [];

    for (let i = 0; i < itemCount && i < shuffledCrops.length; i++) {
      const cropType = shuffledCrops[i];
      const crop = CROPS[cropType];
      // Quantity based on crop tier: lower tier = more needed
      const baseQty = crop.tier <= 2 ? 10 + Math.floor(Math.random() * 15)
        : crop.tier <= 4 ? 5 + Math.floor(Math.random() * 8)
        : 2 + Math.floor(Math.random() * 4);
      items.push({ cropType, quantity: baseQty });
    }

    // Calculate reward: sum of (baseSellPrice * quantity * premiumRate)
    // Premium rate scales with number of items and player level
    const premiumRate = 1.3 + Math.min(0.5, playerLevel * 0.008) + (itemCount - 1) * 0.1;
    let totalBase = 0;
    for (const item of items) {
      totalBase += CROPS[item.cropType].baseSellPrice * item.quantity;
    }
    const totalReward = Math.floor(totalBase * premiumRate);

    traders.push({
      id: `tr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: persona.name,
      emoji: persona.emoji,
      flavorText: persona.texts[Math.floor(Math.random() * persona.texts.length)],
      items,
      totalReward,
      premiumRate: Math.round(premiumRate * 100) / 100,
      fulfilled: false,
    });
  }

  return traders;
}

export function calculateTraderMarketValue(items: { cropType: string; quantity: number }[], marketData: MarketData): number {
  let value = 0;
  for (const item of items) {
    const demand = marketData[item.cropType]?.demand ?? 1;
    value += getCropSellPrice(item.cropType, demand) * item.quantity;
  }
  return value;
}

// ── Seed Lab (Hybrid Crop) System ──

export interface HybridCropDef {
  id: string;
  parent1: string;
  parent2: string;
  name: string;
  emoji: string;
  growthTimeSec: number;
  seedCost: number;
  baseSellPrice: number;
  xpReward: number;
  pestChanceMod: number; // <1 = resistant, >1 = vulnerable
  witherTimeMod: number; // >1 = longer before wither, <1 = shorter
  description: string;
}

const HYBRID_EMOJIS = [
  "🧬", "🔬", "🧪", "✨", "💫", "🌟", "⭐", "🔮", "🌈", "💎",
  "🔱", "🌀", "♟️", "🎭", "🪩", "🫧", "🪷", "🌺", "🍀", "🌳",
];

const HYBRID_TRAITS = [
  "Pest-resistant", "Fast-growing", "High-yield", "Sturdy", "Fragile",
  "Pest-attracting", "Slow-maturing", "Luxurious", "Resilient", "Exotic",
  "Volatile", "Hardy", "Delicate", "Mystic", "Ancient",
];

function hybridHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return (h & 0x7fffffff) / 0x7fffffff;
}

function hybridHashN(id: string, n: number): number {
  return hybridHash(id + "|" + n);
}

function generateHybridName(p1: string, p2: string): string {
  const n1 = CROPS[p1]?.name ?? p1;
  const n2 = CROPS[p2]?.name ?? p2;
  const mid1 = Math.ceil(n1.length * 0.6);
  const start2 = Math.floor(n2.length * 0.4);
  const portmanteau = (n1.slice(0, mid1) + n2.slice(start2)).replace(/\s+/g, "");
  return portmanteau.slice(0, 12);
}

export function getHybridId(parent1: string, parent2: string): string {
  const [a, b] = [parent1, parent2].sort();
  return `hybrid_${a}_${b}`;
}

export function generateHybridDef(parent1: string, parent2: string): HybridCropDef {
  const id = getHybridId(parent1, parent2);
  const c1 = CROPS[parent1];
  const c2 = CROPS[parent2];
  if (!c1 || !c2) throw new Error("Invalid parent crop");

  const r = (n: number) => hybridHashN(id, n);

  // Stats derived from parents with variation
  const avgGrowth = (c1.growthTimeSec + c2.growthTimeSec) / 2;
  const growthMod = 0.7 + r(1) * 0.6; // 0.7 to 1.3
  const growthTimeSec = Math.max(60, Math.round(avgGrowth * growthMod));

  const avgSell = (c1.baseSellPrice + c2.baseSellPrice) / 2;
  const sellMod = 1.5 + r(2) * 1.5; // 1.5 to 3.0
  const baseSellPrice = Math.round(avgSell * sellMod);

  const avgSeed = (c1.seedCost + c2.seedCost) / 2;
  const seedMod = 1.3 + r(3) * 1.2; // 1.3 to 2.5
  const seedCost = Math.max(1, Math.round(avgSeed * seedMod));

  const avgXp = (c1.xpReward + c2.xpReward) / 2;
  const xpMod = 1.2 + r(4) * 1.0; // 1.2 to 2.2
  const xpReward = Math.round(avgXp * xpMod);

  // Special mods: 0.3 to 2.0
  const pestChanceMod = Math.round((0.3 + r(5) * 1.7) * 100) / 100;
  const witherTimeMod = Math.round((0.4 + r(6) * 1.6) * 100) / 100;

  const emoji = HYBRID_EMOJIS[Math.floor(r(7) * HYBRID_EMOJIS.length)];
  const name = generateHybridName(parent1, parent2);

  // Description based on traits
  const trait1 = HYBRID_TRAITS[Math.floor(r(8) * HYBRID_TRAITS.length)];
  const trait2 = HYBRID_TRAITS[Math.floor(r(9) * HYBRID_TRAITS.length)];
  const description = trait1 === trait2 ? `A ${trait1.toLowerCase()} hybrid.` : `${trait1} & ${trait2.toLowerCase()} cross-breed.`;

  return {
    id, parent1: [parent1, parent2].sort()[0], parent2: [parent1, parent2].sort()[1],
    name, emoji, growthTimeSec, seedCost, baseSellPrice, xpReward,
    pestChanceMod, witherTimeMod, description,
  };
}

export function getHybridMixCost(parent1: string, parent2: string): number {
  const c1 = CROPS[parent1];
  const c2 = CROPS[parent2];
  if (!c1 || !c2) return 0;
  return Math.round((c1.seedCost + c2.seedCost) * 5);
}

export function canAccessSeedLab(masteries: Record<string, { harvestCount: number }>): boolean {
  const baseCropIds = Object.keys(CROPS);
  for (const id of baseCropIds) {
    const count = masteries[id]?.harvestCount ?? 0;
    if (count < 10) return false; // Need mastery level 1 (10 harvests) in ALL crops
  }
  return true;
}

export function getMissingMasteryCount(masteries: Record<string, { harvestCount: number }>): number {
  let missing = 0;
  for (const id of Object.keys(CROPS)) {
    if ((masteries[id]?.harvestCount ?? 0) < 10) missing++;
  }
  return missing;
}

/** Get a CropDef-compatible object for hybrid crops (for backend use) */
export function getHybridAsCropDef(h: HybridCropDef): CropDef {
  return {
    id: h.id,
    name: h.name,
    emoji: h.emoji,
    growthTimeSec: h.growthTimeSec,
    seedCost: h.seedCost,
    baseSellPrice: h.baseSellPrice,
    xpReward: h.xpReward,
    stages: ["🟫", "🧬", "🔬", h.emoji],
    tier: 7, // hybrid tier
    requiredLevel: 1,
    description: h.description,
  };
}

/** Resolve a crop def: checks CROPS first, then falls back to hybrid lookup */
export function resolveCropDef(
  cropType: string,
  hybridMap: Record<string, HybridCropDef>
): CropDef | null {
  if (CROPS[cropType]) return CROPS[cropType];
  const h = hybridMap[cropType];
  if (h) return getHybridAsCropDef(h);
  return null;
}

/** Check if a cropType is a hybrid */
export function isHybridCrop(cropType: string): boolean {
  return cropType.startsWith("hybrid_");
}

/** Get wither time for a hybrid (accounts for witherTimeMod) */
export function getHybridWitherTimeSec(cropType: string, storageLevel: number, hybridMap: Record<string, HybridCropDef>): number {
  const h = hybridMap[cropType];
  if (!h) return 300;
  const baseWither = h.growthTimeSec * (4 + storageLevel * 2);
  return Math.round(baseWither * h.witherTimeMod);
}
