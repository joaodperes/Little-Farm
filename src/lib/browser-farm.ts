/**
 * Entire Little Farm game engine. Runs in the browser with no server or accounts.
 * One IndexedDB record per farm. Every action is saved before its Promise resolves.
 */
import {
  CROPS, ANIMALS, FARM_COLS, INITIAL_FARM_ROWS, UPGRADES, TOTAL_CROP_COUNT,
  effectiveGrowthTime,
  getMedicineMaxCapacity, getMedicineCooldownSec, calculateMedicineRefill,
  xpForLevel, initMarketData, tickMarket, marketTicksToApply,
  shouldCheckPests, rollPestAttacks, getAutoSellerPrice,
  getCropSellPriceWithMastery, getCropXpWithMastery,
  getMasteryLevel, MASTERY_RANKS, isCropUnlocked,
  generateDailyBonus, generateDailyQuests, generateSpecialTraders,
  getAnimalProductsReady, getAnimalNextProductTime, simulateOfflineCycles,
  generateHybridDef, getHybridMixCost, canAccessSeedLab,
  isHybridCrop, getHybridAsCropDef, type CropDef, type HybridCropDef,
  type MarketData, type Quest, type SpecialTrader,
} from "@/lib/game-data";

const DB_NAME = "little-farm-saves";
const STORE = "farms";
const SAVE_VERSION = 2;

export interface PlotSave { id: string; row: number; col: number; cropType: string | null; state: string; plantedAt: string | null }
export interface AnimalSave { id: string; animalType: string; level: number; lastCollectedAt: string; fedAt: string | null }
export interface FarmSave {
  version: number; id: string; coins: number; xp: number; level: number;
  createdAt: string; updatedAt: string; lastOnlineAt: string;
  storageLevel: number; pesticideLevel: number; speedLevel: number;
  autoFarmerCount: number; autoSellerLevel: number;
  autoFarmerEnabled: boolean; autoSellerEnabled: boolean;
  autoFarmerCrop: string | null; autoSellerCrops: string[];
  farmRows: number; farmCols: number; marketData: MarketData; marketUpdatedAt: string;
  lastPestCheck: string; lastDailyBonus: string | null;
  lastQuestDate: string | null; quests: Quest[];
  lastTraderDate: string | null; traders: SpecialTrader[];
  medicineCount: number; lastMedicineRefill: string;
  discoveredHybrids: string[]; plots: PlotSave[];
  inventory: Record<string, number>; masteries: Record<string, number>; animals: AnimalSave[];
}

export interface FarmStateView {
  farm: {
    coins: number; xp: number; level: number; xpInCurrentLevel: number; xpNeeded: number;
    storageLevel: number; pesticideLevel: number; speedLevel: number;
    autoFarmerCount: number; autoSellerLevel: number;
    autoFarmerEnabled: boolean; autoSellerEnabled: boolean;
    autoFarmerCrop: string | null; autoSellerCrops: string;
    farmRows: number; farmCols: number; medicineCount: number; medicineMax: number; medicineNextRefillSec: number;
  };
  plots: Array<PlotSave & { emoji: string; growthPercent: number; cropName: string; timeRemaining: number }>;
  inventory: Record<string, number>;
  market: MarketData;
  offlineProgress: any;
  dailyBonus: any;
  masteries: Record<string, { harvestCount: number; masteryLevel: number; rank: string }>;
  quests: Quest[]; traders: SpecialTrader[];
  animals: Array<{id:string; animalType:string; emoji:string; name:string; productEmoji:string; productName:string; productSellPrice:number; productsReady:number; nextProductTime:number; fedAt:string|null; lastCollectedAt:string; feedCrop:string|null; feedCropEmoji:string; feedCropName:string}>;
  totalHarvests: number; masteryLevel6Count: number; animalCount: number;
  seedLabUnlocked: boolean; discoveredHybrids: string[]; hybridDefs: Record<string, HybridCropDef & {isKnown:boolean}>;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Browser storage unavailable"));
    request.onblocked = () => reject(new Error("Close other Little Farm tabs and retry"));
  });
}

async function storeOp<T>(mode: IDBTransactionMode, callback: (store: IDBObjectStore, resolve: (value:T)=>void, reject:(e:unknown)=>void) => void): Promise<T> {
  const db = await openDB();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const objectStore = tx.objectStore(STORE);
      let result: T;
      let hasResult = false;
      let failed = false;
      tx.oncomplete = () => { if (!failed) resolve(result); };
      tx.onerror = () => { failed = true; reject(tx.error ?? new Error("Failed to save farm")); };
      tx.onabort = () => { failed = true; reject(tx.error ?? new Error("Storage transaction aborted")); };
      try {
        callback(objectStore, v => { result=v; hasResult=true; }, e => { failed=true; reject(e); });
      } catch (e) { failed=true; tx.abort(); reject(e); }
    });
  } finally { db.close(); }
}

const load = (id:string) => storeOp<FarmSave | undefined>("readonly", (s, done) => {
  const r = s.get(id); r.onsuccess = () => done(r.result as FarmSave | undefined);
});
const save = (farm:FarmSave) => storeOp<void>("readwrite", (s, done) => { s.put(farm); done(); });
const all = () => storeOp<FarmSave[]>("readonly", (s, done) => {
  const r=s.getAll(); r.onsuccess=()=>done(r.result as FarmSave[]);
});

// Local serialized queue: prevents fast repeated clicks from overwriting each other.
let queue: Promise<unknown> = Promise.resolve();
function serialized<T>(fn:()=>Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

function createFarm(id:string, now:Date):FarmSave {
  const iso=now.toISOString();
  return {
    version:SAVE_VERSION, id, coins:50, xp:0, level:1, createdAt:iso, updatedAt:iso, lastOnlineAt:iso,
    storageLevel:0, pesticideLevel:0, speedLevel:0, autoFarmerCount:0, autoSellerLevel:0,
    autoFarmerEnabled:true, autoSellerEnabled:true, autoFarmerCrop:null, autoSellerCrops:[],
    farmRows:INITIAL_FARM_ROWS, farmCols:FARM_COLS, marketData:initMarketData(), marketUpdatedAt:iso,
    lastPestCheck:iso, lastDailyBonus:null, lastQuestDate:null, quests:[], lastTraderDate:null, traders:[],
    medicineCount:0, lastMedicineRefill:iso, discoveredHybrids:[],
    plots:Array.from({length:INITIAL_FARM_ROWS * FARM_COLS}, (_,i)=>({id:crypto.randomUUID(),row:Math.floor(i/FARM_COLS),col:i%FARM_COLS,cropType:null,state:"empty",plantedAt:null})),
    inventory:{},masteries:{},animals:[],
  };
}

function hybridMap(f:FarmSave):Record<string,HybridCropDef> {
  const res:Record<string,HybridCropDef>={};
  for (const id of f.discoveredHybrids) {
    if (!isHybridCrop(id)) continue;
    // Hybrid parent IDs may contain underscores; split only at a valid crop boundary.
    const suffix=id.slice("hybrid_".length);
    for(const first of Object.keys(CROPS)) {
      if(!suffix.startsWith(`${first}_`))continue;
      const second=suffix.slice(first.length+1);
      if(!CROPS[second])continue;
      const def=generateHybridDef(first,second);
      if(def.id===id){res[id]=def;break;}
    }
  }
  return res;
}
function cropFor(f:FarmSave, id:string):CropDef | null {
  if (CROPS[id]) return CROPS[id];
  const hybrid=hybridMap(f)[id];
  return hybrid ? getHybridAsCropDef(hybrid) : null;
}
function progress(f:FarmSave,p:PlotSave,now:Date):number {
  if (!p.cropType || !p.plantedAt) return 0;
  const c=cropFor(f,p.cropType);
  if (!c) return 0;
  return Math.max(0, Math.min(1, (now.getTime()-Date.parse(p.plantedAt))/1000/effectiveGrowthTime(c.growthTimeSec,f.speedLevel)));
}
function withered(f:FarmSave,p:PlotSave,now:Date):boolean {
  if(!p.cropType||!p.plantedAt) return false;
  const c=cropFor(f,p.cropType); if(!c) return false;
  const hybrid=hybridMap(f)[p.cropType];
  return (now.getTime()-Date.parse(p.plantedAt))/1000 > c.growthTimeSec * (4+f.storageLevel*2)*(hybrid?.witherTimeMod??1);
}
function addInv(f:FarmSave,key:string,quantity:number) {
  f.inventory[key]=Math.max(0,(f.inventory[key]??0)+quantity);
  if(f.inventory[key]===0) delete f.inventory[key];
}
function addXP(f:FarmSave,amount:number):{leveledUp:boolean;newLevel:number} {
  const old=f.level; f.xp+=amount;
  while(f.level<500 && f.xp>=xpForLevel(f.level)) f.level++;
  return {leveledUp:f.level>old,newLevel:f.level};
}
function questProgress(f:FarmSave,type:string,amount:number,crop?:string) {
  for(const q of f.quests) {
    if(q.claimed || q.type!==type || (q.type==="harvest_specific" && crop!==q.cropType)) continue;
    q.progress=Math.min(q.target,q.progress+amount); q.completed=q.progress>=q.target;
  }
}
function harvestReward(f:FarmSave,id:string,amount:number):number {
  const previous=f.masteries[id]??0;
  // Batch approximates the per-harvest mastery multiplier as mastery increases.
  let xp=0;
  const crop=cropFor(f,id);
  for(let i=0;i<amount;i++) {
    const masteryLevel=getMasteryLevel(previous+i);
    xp+=CROPS[id]?getCropXpWithMastery(id,masteryLevel)
      :crop?Math.max(1,Math.floor(crop.xpReward*(1+masteryLevel*0.02))):0;
  }
  f.masteries[id]=previous+amount;
  addInv(f,`crop_${id}`,amount); addXP(f,xp);
  questProgress(f,"harvest_any",amount);questProgress(f,"harvest_specific",amount,id);questProgress(f,"earn_xp",xp);
  return xp;
}

function advance(f:FarmSave,now:Date):{offlineProgress:any;dailyBonus:any} {
  const last=new Date(f.lastOnlineAt);
  const elapsed=now.getTime()-last.getTime();
  const isOffline=elapsed>10_000;
  let offlineProgress:any=null;
  let dailyBonus:any=null;
  const marketChanges=marketTicksToApply(new Date(f.marketUpdatedAt),now);
  if(marketChanges>0) {
    for(let i=0;i<marketChanges;i++) f.marketData=tickMarket(f.marketData);
    f.marketUpdatedAt=now.toISOString();
  }
  // On extended absence simulate multiple farming cycles, including replanting and seller earnings.
  let sim:any=null;
  if(isOffline && f.autoFarmerEnabled && f.autoFarmerCount>0) {
    sim=simulateOfflineCycles({
      plots:f.plots.map(p=>({...p,plantedAt:p.plantedAt?new Date(p.plantedAt):null})),
      inventory:f.inventory, autoFarmerCount:f.autoFarmerCount,
      autoSellerLevel:f.autoSellerEnabled?f.autoSellerLevel:0,
      autoSellerCrops:f.autoSellerCrops, marketData:f.marketData,
      playerLevel:f.level,speedLevel:f.speedLevel,storageLevel:f.storageLevel,
      fromTimeMs:last.getTime(),toTimeMs:now.getTime(), masteryMap:f.masteries,preferredCrop:f.autoFarmerCrop,
    });
    for(const next of sim.finalPlots) {
      const p=f.plots.find(p=>p.id===next.id);
      if(p){p.cropType=next.cropType;p.state=next.state;p.plantedAt=next.plantedAtMs?new Date(next.plantedAtMs).toISOString():null;}
    }
    for(const [key,delta] of Object.entries(sim.inventoryDeltas as Record<string,number>))addInv(f,key,delta);
    f.coins+=sim.totalCoinsFromSeller;
    addXP(f,sim.totalXpGain);
    questProgress(f,"harvest_any",sim.totalHarvested);
    questProgress(f,"earn_xp",sim.totalXpGain);
    for(const [id,count] of Object.entries(sim.harvestByCrop as Record<string,number>)) {
      f.masteries[id]=(f.masteries[id]??0)+count; questProgress(f,"harvest_specific",count,id);
    }
  }
  for(const p of f.plots) {
    if(p.state!=="growing" || !p.plantedAt || !p.cropType) continue;
    if(withered(f,p,now))p.state="withered";
    else if(progress(f,p,now)>=1)p.state="mature";
  }
  let pests:string[]=[];
  if(shouldCheckPests(new Date(f.lastPestCheck),now)) {
    pests=rollPestAttacks(f.plots.filter(p=>p.state==="growing").map(p=>p.id),f.pesticideLevel,now);
    for(const p of f.plots)if(pests.includes(p.id))p.state="pest";
    f.lastPestCheck=now.toISOString();
  }
  const med=calculateMedicineRefill(f.medicineCount,new Date(f.lastMedicineRefill),now,f.storageLevel);
  f.medicineCount=med.newCount;f.lastMedicineRefill=med.lastRefill.toISOString();
  if(!isOffline && f.autoFarmerEnabled && f.autoFarmerCount>0) {
    const ready=f.plots.filter(p=>p.state==="mature").slice(0,f.autoFarmerCount);
    for(const p of ready) {
      if(!p.cropType)continue;
      harvestReward(f,p.cropType,1);
      p.cropType=null;p.plantedAt=null;p.state="empty";
    }
    let budget=f.autoFarmerCount-ready.length;
    while(budget>0) {
      const empty=f.plots.find(p=>p.state==="empty");if(!empty)break;
      const candidates=Object.values(CROPS).filter(c=>isCropUnlocked(c,f.level) && (f.inventory[`seed_${c.id}`]??0)>0);
      const preferred=candidates.find(c=>c.id===f.autoFarmerCrop);
      const c=preferred??candidates.sort((a,b)=>a.seedCost-b.seedCost)[0];
      if(!c)break;
      addInv(f,`seed_${c.id}`,-1);empty.cropType=c.id;empty.plantedAt=now.toISOString();empty.state="growing";
      questProgress(f,"plant_seeds",1); budget--;
    }
  }
  if(!isOffline && f.autoSellerEnabled && f.autoSellerLevel>0) {
    let budget=f.autoSellerLevel+1;
    const items=Object.keys(f.inventory).filter(k=>k.startsWith("crop_") && f.inventory[k]>0)
      .sort((a,b)=>(CROPS[a.slice(5)]?.baseSellPrice??0)-(CROPS[b.slice(5)]?.baseSellPrice??0));
    for(const key of items) {
      if(budget<=0)break;
      const crop=key.slice(5);
      if(isHybridCrop(crop)|| (f.autoSellerCrops.length>0&&!f.autoSellerCrops.includes(crop)))continue;
      const amount=Math.min(f.inventory[key],budget);
      const earned=getAutoSellerPrice(crop,f.marketData[crop]?.demand??1,f.autoSellerLevel)*amount;
      addInv(f,key,-amount);f.coins+=earned;budget-=amount;
    }
  }
  const day=now.toDateString();
  if(!f.lastDailyBonus || new Date(f.lastDailyBonus).toDateString()!==day) {
    dailyBonus=generateDailyBonus(f.level);
    f.coins+=dailyBonus.coins;
    for(const seed of dailyBonus.seeds)addInv(f,`seed_${seed.cropType}`,seed.quantity);
    f.lastDailyBonus=now.toISOString();
  }
  if(!f.lastQuestDate || new Date(f.lastQuestDate).toDateString()!==day) {
    f.quests=generateDailyQuests(f.level);f.lastQuestDate=now.toISOString();
  }
  if(!f.lastTraderDate || new Date(f.lastTraderDate).toDateString()!==day) {
    f.traders=generateSpecialTraders(f.level);f.lastTraderDate=now.toISOString();
  }
  if(isOffline) {
    offlineProgress=sim && sim.totalHarvested>0 ? {
      cropsReady:[],cropsWithered:[],pestAttacks:pests,totalElapsed:Math.floor(elapsed/1000),marketChanges,
      autoHarvested:sim.totalHarvested,autoPlanted:sim.totalPlanted,autoCoinsEarned:sim.totalCoinsFromSeller,
      autoCycles:sim.cyclesCompleted,autoWithered:sim.totalWithered,
    } : {
      cropsReady:f.plots.filter(p=>p.state==="mature"&&p.cropType).map(p=>p.cropType),
      cropsWithered:f.plots.filter(p=>p.state==="withered"&&p.cropType).map(p=>p.cropType),
      pestAttacks:pests,totalElapsed:Math.floor(elapsed/1000),marketChanges,
    };
  }
  f.lastOnlineAt=now.toISOString();f.updatedAt=now.toISOString();
  return {offlineProgress,dailyBonus};
}

function view(f:FarmSave,now:Date,notice:{offlineProgress:any;dailyBonus:any}):FarmStateView {
  const masteries:FarmStateView["masteries"]={};
  let totalHarvests=0,masteryLevel6Count=0;
  for(const [id,count] of Object.entries(f.masteries)) {
    const lvl=getMasteryLevel(count),rank=MASTERY_RANKS[lvl-1];
    masteries[id]={harvestCount:count,masteryLevel:lvl,rank:rank?`${rank.emoji} ${rank.name}`:"🌱 Novice"};
    totalHarvests+=count;if(lvl>=6)masteryLevel6Count++;
  }
  const hybs=hybridMap(f);
  const plots=f.plots.map(p=>{
    const c=p.cropType?cropFor(f,p.cropType):null;
    const growth=progress(f,p,now),pct=Math.floor(growth*100);
    const timeRemaining=c&&p.plantedAt&&p.state==="growing"?Math.max(0,effectiveGrowthTime(c.growthTimeSec,f.speedLevel)-(now.getTime()-Date.parse(p.plantedAt))/1000):0;
    const emoji=p.state==="withered"?"🥀":p.state==="pest"?"🐛":p.state==="mature"?c?.stages[3]??"🌾":c?.stages[growth>=0.6?2:growth>=0.2?1:0]??"🟫";
    return {...p,emoji,growthPercent:p.state==="mature"||p.state==="withered"?100:pct,cropName:c?.name??"",timeRemaining};
  });
  const prev=f.level>1?xpForLevel(f.level-1):0;
  const capacity=getMedicineMaxCapacity(f.storageLevel);
  const defs:FarmStateView["hybridDefs"]={};
  for(const [id,h] of Object.entries(hybs))defs[id]={...h,isKnown:(f.masteries[id]??0)>=10};
  return {
    farm:{
      coins:f.coins,xp:f.xp,level:f.level,xpInCurrentLevel:f.xp-prev,xpNeeded:xpForLevel(f.level)-prev,
      storageLevel:f.storageLevel,pesticideLevel:f.pesticideLevel,speedLevel:f.speedLevel,
      autoFarmerCount:f.autoFarmerCount,autoSellerLevel:f.autoSellerLevel,
      autoFarmerEnabled:f.autoFarmerEnabled,autoSellerEnabled:f.autoSellerEnabled,
      autoFarmerCrop:f.autoFarmerCrop,autoSellerCrops:JSON.stringify(f.autoSellerCrops),
      farmRows:f.farmRows,farmCols:f.farmCols,medicineCount:f.medicineCount,medicineMax:capacity,
      medicineNextRefillSec:capacity>f.medicineCount?Math.max(0,getMedicineCooldownSec(f.storageLevel)-(now.getTime()-Date.parse(f.lastMedicineRefill))/1000):0,
    },
    plots,inventory:{...f.inventory},market:f.marketData,offlineProgress:notice.offlineProgress,dailyBonus:notice.dailyBonus,
    masteries,quests:f.quests,traders:f.traders,
    animals:f.animals.map(a=>{
      const def=ANIMALS[a.animalType],crop=def?CROPS[def.feedCrop]:null;
      return {
        id:a.id,animalType:a.animalType,emoji:def?.emoji??"❓",name:def?.name??a.animalType,
        productEmoji:def?.productEmoji??"",productName:def?.productName??"",productSellPrice:def?.productSellPrice??0,
        productsReady:def?getAnimalProductsReady(a.animalType,new Date(a.lastCollectedAt),a.fedAt?new Date(a.fedAt):null,now):0,
        nextProductTime:def?getAnimalNextProductTime(a.animalType,new Date(a.lastCollectedAt),a.fedAt?new Date(a.fedAt):null,now):0,
        fedAt:a.fedAt,lastCollectedAt:a.lastCollectedAt,feedCrop:def?.feedCrop??null,feedCropEmoji:crop?.emoji??"",feedCropName:crop?.name??"",
      };
    }),
    totalHarvests,masteryLevel6Count,animalCount:f.animals.length,
    seedLabUnlocked:canAccessSeedLab(Object.fromEntries(Object.entries(f.masteries).map(([k,v])=>[k,{harvestCount:v}]))),
    discoveredHybrids:[...f.discoveredHybrids],hybridDefs:defs,
  };
}

export async function getFarmState(id:string):Promise<FarmStateView> {
  return serialized(async()=>{
    const now=new Date();
    const f=(await load(id))??createFarm(id,now);
    const notice=advance(f,now);
    await save(f);
    return view(f,now,notice);
  });
}

export type FarmAction = "harvest"|"plant"|"spray"|"buy"|"sell"|"upgrade"|"toggle"|"quests/claim"|"animals/buy"|"animals/feed"|"animals/collect"|"traders/fulfill"|"seed-lab/mix";
export interface ActionResult {success?:boolean; error?:string;message?:string;leveledUp?:boolean;newLevel?:number;isNew?:boolean;hybrid?:any}
function failure(error:string):ActionResult{return {success:false,error};}
function positive(message:string,more:Partial<ActionResult>={}):ActionResult{return {success:true,message,...more};}
function validQuantity(n:unknown):n is number{return typeof n==="number"&&Number.isSafeInteger(n)&&n>=1&&n<=100000;}
function act(f:FarmSave,action:FarmAction,b:any,now:Date):ActionResult {
  const plot=f.plots.find(p=>p.id===b.plotId);
  switch(action){
    case "buy": {
      const c=CROPS[b.cropType],qty=b.quantity??1;
      if(!c||!validQuantity(qty))return failure("Invalid crop or quantity");
      if(!isCropUnlocked(c,f.level))return failure(`${c.name} requires Lv.${c.requiredLevel}`);
      const cost=c.seedCost*qty;if(f.coins<cost)return failure(`Not enough coins! Need ${cost}🪙`);
      f.coins-=cost;addInv(f,`seed_${c.id}`,qty);
      return positive(`Bought ${qty}× ${c.name} seeds for ${cost}🪙`);
    }
    case "plant": {
      const c=typeof b.cropType==="string"?cropFor(f,b.cropType):null;
      if(!c)return failure("Invalid crop type");
      if(!isHybridCrop(c.id)&&!isCropUnlocked(c,f.level))return failure(`${c.name} requires Lv.${c.requiredLevel}`);
      if((f.inventory[`seed_${c.id}`]??0)<1)return failure(`No ${c.name} seeds! Buy some from the shop.`);
      if(!plot||plot.state!=="empty")return failure("Plot is not empty");
      addInv(f,`seed_${c.id}`,-1);plot.cropType=c.id;plot.plantedAt=now.toISOString();plot.state="growing";
      questProgress(f,"plant_seeds",1);
      return positive(`Planted ${c.emoji} ${c.name}!`);
    }
    case "harvest": {
      if(!plot||!plot.cropType||!plot.plantedAt)return failure("Nothing to harvest");
      const c=cropFor(f,plot.cropType);if(!c)return failure("Unknown crop");
      const id=plot.cropType;
      if(plot.state==="pest"||plot.state==="withered"||withered(f,plot,now)){
        const msg=plot.state==="pest"?`${c.name} was lost to pests! 🐛`:`${c.name} withered! 🥀`;
        plot.cropType=null;plot.plantedAt=null;plot.state="empty";return {success:false,message:msg};
      }
      if(progress(f,plot,now)<1)return failure(`Not ready yet! ${Math.floor(progress(f,plot,now)*100)}% grown.`);
      const oldMastery=getMasteryLevel(f.masteries[id]??0);
      const oldLevel=f.level,xp=harvestReward(f,id,1);
      plot.cropType=null;plot.plantedAt=null;plot.state="empty";
      const newMastery=getMasteryLevel(f.masteries[id]);
      let message=`Harvested ${c.emoji} ${c.name}! +${xp} XP`;
      if(newMastery>oldMastery){const r=MASTERY_RANKS[newMastery-1];message+=` | ${r.emoji} ${r.name} Mastery!`;}
      if(f.level>oldLevel)message+=` 🎉 LEVEL UP → Lv.${f.level}`;
      return positive(message,{leveledUp:f.level>oldLevel,newLevel:f.level});
    }
    case "spray":{
      if(!plot||plot.state!=="pest")return failure("No pest on this plot");
      if(f.medicineCount<=0)return failure(f.storageLevel<=0?"No medicine! Upgrade Storage House to generate medicine 💊":"No medicine left! Wait for Storage House to generate more 💊");
      f.medicineCount--;plot.state="growing";
      return positive(`Used 💊 medicine! Crop saved! (${f.medicineCount} remaining)`);
    }
    case "sell":{
      const qty=b.quantity??1;
      if(!validQuantity(qty))return failure("Invalid quantity");
      let key="",price=0,name="",emoji="";
      if(typeof b.itemType==="string"&&b.itemType.startsWith("product_")){
        const a=Object.values(ANIMALS).find(a=>`product_${a.productName.toLowerCase()}`===b.itemType);
        if(!a)return failure("Unknown product");
        key=b.itemType;price=a.productSellPrice;name=a.productName;emoji=a.productEmoji;
      }else{
        const id=b.cropType,c=typeof id==="string"?cropFor(f,id):null;
        if(!c)return failure("Invalid crop type");
        if(isHybridCrop(id)&&(f.masteries[id]??0)<10)return failure("Unknown hybrid! Grow 10 to identify it before selling.");
        const ml=getMasteryLevel(f.masteries[id]??0);
        price=isHybridCrop(id)?Math.round(c.baseSellPrice*(1+ml*0.03)):getCropSellPriceWithMastery(id,f.marketData[id]?.demand??1,ml);
        key=`crop_${id}`;name=c.name;emoji=c.emoji;
      }
      if((f.inventory[key]??0)<qty)return failure(`Not enough ${name}! Have ${f.inventory[key]??0}, need ${qty}`);
      const earned=price*qty;addInv(f,key,-qty);f.coins+=earned;
      if(!key.startsWith("product_"))questProgress(f,"sell_coins",earned);
      return positive(`Sold ${qty}× ${emoji} ${name} for ${earned}🪙`);
    }
    case "upgrade":{
      const def=UPGRADES[b.upgradeId];if(!def)return failure("Unknown upgrade");
      const level=b.upgradeId==="expand"?f.farmRows-INITIAL_FARM_ROWS:b.upgradeId==="autoFarmer"?Math.floor(f.autoFarmerCount/5):b.upgradeId==="autoSeller"?f.autoSellerLevel:b.upgradeId==="storage"?f.storageLevel:b.upgradeId==="pesticide"?f.pesticideLevel:b.upgradeId==="speed"?f.speedLevel:0;
      if(level>=def.maxLevel)return failure("Already at max level!");
      const cost=def.costFormula(level,{farmRows:f.farmRows,autoFarmerCount:f.autoFarmerCount});
      if(f.coins<cost)return failure(`Not enough coins! Need ${cost}🪙, have ${f.coins}🪙`);
      f.coins-=cost;
      switch(b.upgradeId){
        case "expand":for(let col=0;col<FARM_COLS;col++)f.plots.push({id:crypto.randomUUID(),row:f.farmRows,col,cropType:null,plantedAt:null,state:"empty"});f.farmRows++;break;
        case "storage":f.storageLevel++;break;
        case "pesticide":f.pesticideLevel++;break;
        case "speed":f.speedLevel++;break;
        case "autoFarmer":f.autoFarmerCount+=5;break;
        case "autoSeller":f.autoSellerLevel++;break;
      }
      return positive(`${def.emoji} ${def.name} upgraded! ${def.effectDescription(level+1)}`);
    }
    case "toggle":{
      if(b.feature==="autoFarmerCrop"){
        if(b.cropType!==null&&typeof b.cropType!=="string")return failure("Invalid crop type");
        f.autoFarmerCrop=b.cropType;return positive(b.cropType?"🤖 Auto Farmer crop changed":"🤖 Auto Farmer set to cheapest");
      }
      if(b.feature==="autoSellerCrop"){
        if(typeof b.cropType!=="string"||typeof b.enabled!=="boolean"||!CROPS[b.cropType])return failure("Invalid crop toggle");
        f.autoSellerCrops=b.enabled?[...new Set([...f.autoSellerCrops,b.cropType])]:f.autoSellerCrops.filter(c=>c!==b.cropType);
        return positive(`💰 ${b.cropType} ${b.enabled?"added to":"removed from"} auto-seller`);
      }
      if(!["autoFarmer","autoSeller"].includes(b.feature)||typeof b.enabled!=="boolean")return failure("Invalid toggle");
      if(b.feature==="autoFarmer")f.autoFarmerEnabled=b.enabled;else f.autoSellerEnabled=b.enabled;
      return positive(`${b.feature==="autoFarmer"?"🤖 Auto Farmer":"💰 Auto Seller"} ${b.enabled?"ON":"OFF"}`);
    }
    case "quests/claim":{
      const q=f.quests.find(q=>q.id===b.questId);
      if(!q)return failure("Quest not found");
      if(q.claimed)return failure("Already claimed");
      if(!q.completed)return failure("Quest not yet completed");
      const old=f.level;q.claimed=true;f.coins+=q.reward.coins;
      const lev=addXP(f,q.reward.xp);
      if(q.reward.seedCropType&&q.reward.seedQuantity)addInv(f,`seed_${q.reward.seedCropType}`,q.reward.seedQuantity);
      return positive(`Claimed: ${q.reward.coins}🪙 +${q.reward.xp} XP${lev.leveledUp?` 🎉 Lv.${f.level}!`:""}`,lev);
    }
    case "animals/buy":{
      const def=ANIMALS[b.animalType];if(!def)return failure("Unknown animal");
      if(f.level<def.requiredLevel)return failure(`Requires Lv.${def.requiredLevel}!`);
      if(f.coins<def.cost)return failure(`Need ${def.cost}🪙, have ${f.coins}🪙`);
      if(f.animals.filter(a=>a.animalType===b.animalType).length>=def.maxPerFarm)return failure(`Max ${def.maxPerFarm} ${def.name}s!`);
      f.coins-=def.cost;f.animals.push({id:crypto.randomUUID(),animalType:def.id,level:1,lastCollectedAt:now.toISOString(),fedAt:null});
      return positive(`Bought ${def.emoji} ${def.name} for ${def.cost}🪙!`);
    }
    case "animals/feed":{
      const a=f.animals.find(a=>a.id===b.animalId);if(!a)return failure("Animal not found");
      const def=ANIMALS[a.animalType];if(!def)return failure("Unknown animal type");
      const key=`crop_${def.feedCrop}`;
      if((f.inventory[key]??0)<1)return failure(`Need 1 ${CROPS[def.feedCrop]?.name??def.feedCrop} (harvested) to feed!`);
      addInv(f,key,-1);a.fedAt=now.toISOString();
      return positive(`Fed ${def.emoji} ${def.name}! Production speed 2× for next cycle 🌾`);
    }
    case "animals/collect":{
      const a=f.animals.find(a=>a.id===b.animalId);if(!a)return failure("Animal not found");
      const def=ANIMALS[a.animalType];if(!def)return failure("Unknown animal type");
      const qty=getAnimalProductsReady(a.animalType,new Date(a.lastCollectedAt),a.fedAt?new Date(a.fedAt):null,now);
      if(qty<=0)return failure("Nothing to collect yet!");
      addInv(f,`product_${def.productName.toLowerCase()}`,qty);
      a.lastCollectedAt=now.toISOString();a.fedAt=null;
      return positive(`Collected ${qty}× ${def.productEmoji} ${def.productName}!`);
    }
    case "traders/fulfill":{
      const t=f.traders.find(t=>t.id===b.traderId);if(!t)return failure("Trader not found");
      if(t.fulfilled)return failure("Order already fulfilled");
      for(const item of t.items)if((f.inventory[`crop_${item.cropType}`]??0)<item.quantity)return failure(`Need ${item.quantity}× ${CROPS[item.cropType]?.name??item.cropType}, have ${f.inventory[`crop_${item.cropType}`]??0}`);
      for(const item of t.items)addInv(f,`crop_${item.cropType}`,-item.quantity);
      t.fulfilled=true;f.coins+=t.totalReward;questProgress(f,"sell_coins",t.totalReward);
      return positive(`${t.emoji} ${t.name} fulfilled! +${t.totalReward}🪙`);
    }
    case "seed-lab/mix":{
      const {parent1,parent2}=b;
      if(!CROPS[parent1]||!CROPS[parent2]||parent1===parent2)return failure("Select two different valid crops");
      if(!canAccessSeedLab(Object.fromEntries(Object.entries(f.masteries).map(([k,v])=>[k,{harvestCount:v}]))))return failure(`Seed Lab locked! Need mastery in all ${TOTAL_CROP_COUNT} crops.`);
      if((f.inventory[`seed_${parent1}`]??0)<3||(f.inventory[`seed_${parent2}`]??0)<3)return failure("Need 3 seeds of each parent crop");
      const cost=getHybridMixCost(parent1,parent2);if(f.coins<cost)return failure(`Need ${cost}🪙 for mixing`);
      const hybrid=generateHybridDef(parent1,parent2);const isNew=!f.discoveredHybrids.includes(hybrid.id);
      addInv(f,`seed_${parent1}`,-3);addInv(f,`seed_${parent2}`,-3);addInv(f,`seed_${hybrid.id}`,3);
      f.coins-=cost;if(isNew)f.discoveredHybrids.push(hybrid.id);
      return positive(`Mixed ${hybrid.name}!`,{hybrid:{...hybrid,seedsGranted:3},isNew});
    }
  }
  return failure("Unknown action");
}

export async function farmAction(id:string, action:FarmAction, body:Record<string,unknown>):Promise<ActionResult> {
  return serialized(async()=>{
    const f=await load(id);
    if(!f)return failure("Farm not found");
    const now=new Date();
    advance(f,now);
    const result=act(f,action,body,now);
    // Persist all mutations atomically, even if action fails (time simulation can have advanced).
    await save(f);
    return result;
  });
}

export async function listPlayers():Promise<Array<{id:string;level:number;createdAt:string;lastOnlineAt:string}>> {
  return serialized(async()=>(await all()).sort((a,b)=>b.lastOnlineAt.localeCompare(a.lastOnlineAt)).map(f=>({id:f.id,level:f.level,createdAt:f.createdAt,lastOnlineAt:f.lastOnlineAt})));
}
export async function deletePlayer(id:string):Promise<void> {
  await serialized(()=>storeOp<void>("readwrite",(s,done)=>{s.delete(id);done();}));
}
export async function exportFarms():Promise<string> {
  const players=await serialized(all);
  return JSON.stringify({app:"Little Farm",version:SAVE_VERSION,exportedAt:new Date().toISOString(),players},null,2);
}

const dateString = (v:unknown, fallback:string):string => {
  if (typeof v!=="string" || !Number.isFinite(Date.parse(v)))return fallback;
  return new Date(v).toISOString();
};
function parseList<T>(v:unknown):T[] {
  if(Array.isArray(v))return v as T[];
  try{const r=JSON.parse(String(v??"[]"));return Array.isArray(r)?r:[];}catch{return [];}
}
function parseObj<T>(v:unknown,fallback:T):T {
  if(v&&typeof v==="object"&&!Array.isArray(v))return v as T;
  try {const r=JSON.parse(String(v));return r&&typeof r==="object"&&!Array.isArray(r)?r:fallback;}catch{return fallback;}
}
function nonneg(v:unknown,fallback=0){return typeof v==="number"&&Number.isFinite(v)?Math.max(0,Math.floor(v)):fallback;}
function convertFarm(raw:any):FarmSave {
  if(!raw || typeof raw!=="object" || typeof raw.id!=="string" || !/^[\p{L}\p{N}_\- ]{1,20}$/u.test(raw.id))throw new Error("Invalid farm profile in backup");
  const base=createFarm(raw.id,new Date());
  const legacy=raw.version!==SAVE_VERSION;
  const inv=legacy?Object.fromEntries(parseList<any>(raw.inventoryItems).filter(v=>v?.itemType).map(v=>[v.itemType,nonneg(v.quantity)])):parseObj<Record<string,number>>(raw.inventory,{});
  const masteries=legacy?Object.fromEntries(parseList<any>(raw.masteries).filter(v=>v?.cropType).map(v=>[v.cropType,nonneg(v.harvestCount)])):parseObj<Record<string,number>>(raw.masteries,{});
  const plots=parseList<any>(raw.plots).map((p:any)=>({
    id:typeof p.id==="string"?p.id:crypto.randomUUID(),row:nonneg(p.row),col:nonneg(p.col),
    cropType:typeof p.cropType==="string"?p.cropType:null,
    state:["empty","growing","mature","withered","pest"].includes(p.state)?p.state:"empty",
    plantedAt:p.plantedAt?dateString(p.plantedAt,base.createdAt):null,
  }));
  const animals=parseList<any>(raw.animals).filter(a=>ANIMALS[a?.animalType]).map(a=>({
    id:typeof a.id==="string"?a.id:crypto.randomUUID(),animalType:a.animalType,level:nonneg(a.level,1),
    lastCollectedAt:dateString(a.lastCollectedAt,base.createdAt),fedAt:a.fedAt?dateString(a.fedAt,base.createdAt):null,
  }));
  const f:FarmSave={
    ...base,
    coins:nonneg(raw.coins,50),xp:nonneg(raw.xp),level:Math.max(1,nonneg(raw.level,1)),
    createdAt:dateString(raw.createdAt,base.createdAt),updatedAt:dateString(raw.updatedAt,base.updatedAt),
    lastOnlineAt:dateString(raw.lastOnlineAt,base.lastOnlineAt),
    storageLevel:nonneg(raw.storageLevel),pesticideLevel:nonneg(raw.pesticideLevel),speedLevel:nonneg(raw.speedLevel),
    autoFarmerCount:nonneg(raw.autoFarmerCount),autoSellerLevel:nonneg(raw.autoSellerLevel),
    autoFarmerEnabled:raw.autoFarmerEnabled!==false,autoSellerEnabled:raw.autoSellerEnabled!==false,
    autoFarmerCrop:typeof raw.autoFarmerCrop==="string"?raw.autoFarmerCrop:null,
    autoSellerCrops:parseList<string>(raw.autoSellerCrops).filter(x=>typeof x==="string"),
    farmRows:Math.max(INITIAL_FARM_ROWS,nonneg(raw.farmRows,INITIAL_FARM_ROWS)),farmCols:FARM_COLS,
    marketData:parseObj<MarketData>(raw.marketData,initMarketData()),marketUpdatedAt:dateString(raw.marketUpdatedAt,base.marketUpdatedAt),
    lastPestCheck:dateString(raw.lastPestCheck,base.lastPestCheck),lastDailyBonus:raw.lastDailyBonus?dateString(raw.lastDailyBonus,base.createdAt):null,
    lastQuestDate:raw.lastQuestDate?dateString(raw.lastQuestDate,base.createdAt):null,
    quests:parseList<Quest>(legacy?raw.questData:raw.quests),lastTraderDate:raw.lastTraderDate?dateString(raw.lastTraderDate,base.createdAt):null,
    traders:parseList<SpecialTrader>(legacy?raw.traderData:raw.traders),medicineCount:nonneg(raw.medicineCount),
    lastMedicineRefill:dateString(raw.lastMedicineRefill,base.lastMedicineRefill),
    discoveredHybrids:parseList<string>(raw.discoveredHybrids).filter(x=>typeof x==="string"),
    plots:plots.length?plots:base.plots,inventory:Object.fromEntries(Object.entries(inv).filter(([,v])=>typeof v === "number" && Number.isFinite(v) && v>=0).map(([k,v])=>[k,nonneg(v)])),
    masteries:Object.fromEntries(Object.entries(masteries).filter(([,v])=>typeof v === "number" && Number.isFinite(v) && v>=0).map(([k,v])=>[k,nonneg(v)])),animals,
  };
  return f;
}
export async function importFarms(text:string):Promise<number> {
  if(text.length>10_000_000)throw new Error("Backup is too large");
  let data:any;
  try{data=JSON.parse(text);}catch{throw new Error("Backup is not valid JSON");}
  if(!data||![1,2].includes(data.version)||!Array.isArray(data.players)||data.players.length>100)
    throw new Error("Not a Little Farm backup (expected version 1 or 2)");
  const farms=data.players.map(convertFarm);
  if(new Set(farms.map(f=>f.id)).size!==farms.length)throw new Error("Duplicate profiles in backup");
  // All records verified before any are written. Overwrites matching local names.
  await serialized(()=>storeOp<void>("readwrite",(s,done)=>{for(const f of farms)s.put(f);done();}));
  return farms.length;
}

export async function requestPersistentStorage():Promise<boolean> {
  if(typeof navigator==="undefined"||!navigator.storage?.persist)return false;
  try{return await navigator.storage.persist();}catch{return false;}
}

/** Compatibility adapter for the original UI's action handlers; no HTTP calls are made. */
export async function farmFetch(path:string, init?:RequestInit):Promise<Response> {
  const url=new URL(path,window.location.href);
  const name=url.searchParams.get("player")??"";
  let payload:any;
  if(url.pathname.endsWith("/api/farm/state") && name) payload=await getFarmState(name);
  else if(name && init?.method==="POST" && url.pathname.includes("/api/farm/")) {
    const action=url.pathname.split("/api/farm/")[1] as FarmAction;
    payload=await farmAction(name,action,JSON.parse(String(init.body??"{}")));
  } else return new Response(JSON.stringify({error:"Invalid local action"}),{status:400,headers:{"Content-Type":"application/json"}});
  return new Response(JSON.stringify(payload),{status:payload.error?400:200,headers:{"Content-Type":"application/json"}});
}
