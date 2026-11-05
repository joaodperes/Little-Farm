"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import FarmHeader from "@/components/farm/FarmHeader";
import FarmTab from "@/components/farm/FarmTab";
import ShopTab from "@/components/farm/ShopTab";
import UpgradesTab from "@/components/farm/UpgradesTab";
import QuestsTab from "@/components/farm/QuestsTab";
import MasteryTab from "@/components/farm/MasteryTab";
import BarnTab from "@/components/farm/BarnTab";
import SeedLabTab from "@/components/farm/SeedLabTab";
import PlayerSelect from "@/components/farm/PlayerSelect";
import { Modals } from "@/components/farm/Modals";
import { type Quest, type MarketData, type SpecialTrader } from "@/lib/game-data";
import { farmFetch as fetch, exportFarms, requestPersistentStorage } from "@/lib/browser-farm";
import { Download } from "lucide-react";
import ThemeToggle from "@/components/farm/ThemeToggle";

// -- Types --

interface FarmData {
  coins: number; xp: number; level: number;
  xpInCurrentLevel: number; xpNeeded: number;
  storageLevel: number; pesticideLevel: number; speedLevel: number;
  autoFarmerCount: number; autoSellerLevel: number;
  autoFarmerEnabled: boolean; autoSellerEnabled: boolean;
  autoFarmerCrop: string | null;
  autoSellerCrops: string;
  farmRows: number; farmCols: number;
  medicineCount: number;
  medicineMax: number;
  medicineNextRefillSec: number;
}

interface PlotData {
  id: string; row: number; col: number;
  cropType: string | null; state: string;
  emoji: string; growthPercent: number; cropName: string; timeRemaining: number;
  plantedAt: string | null;
}

interface AnimalData {
  id: string; animalType: string; emoji: string; name: string;
  productEmoji: string; productName: string; productSellPrice: number;
  productsReady: number; nextProductTime: number;
  fedAt: string | null; lastCollectedAt: string;
  feedCrop: string | null; feedCropEmoji: string; feedCropName: string;
}

interface StateResponse {
  farm: FarmData;
  plots: PlotData[];
  inventory: Record<string, number>;
  market: MarketData;
  offlineProgress: any;
  dailyBonus: any;
  masteries: Record<string, { harvestCount: number; masteryLevel: number; rank: string }>;
  quests: Quest[];
  traders: SpecialTrader[];
  animals: AnimalData[];
  totalHarvests: number;
  masteryLevel6Count: number;
  animalCount: number;
  seedLabUnlocked: boolean;
  discoveredHybrids: string[];
  hybridDefs: Record<string, any>;
}

export default function FarmPage() {
  const [player, setPlayer] = useState<string | null>(null);
  useEffect(() => {
    setPlayer(localStorage.getItem("farmPlayer"));
    requestPersistentStorage().catch(() => undefined);
  }, []);
  const [state, setState] = useState<StateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const retryRef = useRef(0);
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [showOffline, setShowOffline] = useState(false);
  const [showDaily, setShowDaily] = useState(false);
  const [mixResult, setMixResult] = useState<any>(null);
  const [offlineData, setOfflineData] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any>(null);

  const p = (url: string) => `${url}?player=${encodeURIComponent(player!)}`;

  const handleSelectPlayer = (name: string) => {
    localStorage.setItem("farmPlayer", name);
    setPlayer(name);
    setState(null);
    setLoading(true);
    setLoadError(null);
    retryRef.current = 0;
    setSelectedSeed(null);
    setShowOffline(false);
    setOfflineData(null);
    setShowDaily(false);
    setDailyData(null);
  };

  const handleSwitchPlayer = () => {
 setPlayer(null);
    setState(null);
    localStorage.removeItem("farmPlayer");
  };

  // -- Fetch state --
  const fetchState = useCallback(async (isInitial = false) => {
    if (!player) return;
    try {
      const res = await fetch(p("/api/farm/state"));
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Server error: ${res.status}${text ? ` - ${text.slice(0, 100)}` : ''}`);
      }
      const data: StateResponse = await res.json();

      setLoadError(null);
      retryRef.current = 0;

      // Show modals on first load
      if (data.offlineProgress) {
        setOfflineData(data.offlineProgress);
        setShowOffline(true);
      }
      if (data.dailyBonus) {
        setDailyData(data.dailyBonus);
        setShowDaily(true);
      }

      setState(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      {
        const msg = err instanceof Error ? err.message : 'Failed to load farm';
        setLoadError(msg);
        // Auto-retry on initial load (up to 5 times with backoff)
        if (isInitial && retryRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, retryRef.current), 8000);
          retryRef.current += 1;
          setTimeout(() => fetchState(true), delay);
          return; // Don't set loading false yet
        }
        setLoading(false);
      }
    }
  }, [player]);

  useEffect(() => {
    if (player) {
      retryRef.current = 0;
      fetchState(true);
      const iv = setInterval(() => fetchState(false), 5000);
      return () => clearInterval(iv);
    }
  }, [player, fetchState]);

  // -- Actions --
  const handleHarvest = async (plotId: string) => {
    const res = await fetch(p("/api/farm/harvest"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plotId }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else if (data.message) toast.error(data.message);
    if (data.leveledUp) toast.success(`🎉 Level Up! Now Lv.${data.newLevel}`);
    fetchState();
  };

  const handleClear = async (plotId: string) => {
    const res = await fetch(p("/api/farm/clear"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plotId }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.error || data.message || "Could not clear plot");
    fetchState();
  };

  const handlePlant = async (plotId: string, cropType: string) => {
    const res = await fetch(p("/api/farm/plant"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plotId, cropType }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.error);
    fetchState();
  };

  const handleSpray = async (plotId: string) => {
    const res = await fetch(p("/api/farm/spray"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plotId }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.error);
    fetchState();
  };

  const handleBuy = async (cropType: string, quantity: number) => {
    const res = await fetch(p("/api/farm/buy"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cropType, quantity }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.error);
    fetchState();
  };

  const handleSell = async (cropType: string, quantity: number) => {
    const res = await fetch(p("/api/farm/sell"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cropType, quantity }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.error);
    fetchState();
  };

  const handleSellProduct = async (itemType: string, quantity: number) => {
    const res = await fetch(p("/api/farm/sell"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemType, quantity }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.error);
    fetchState();
  };

  const handleUpgrade = async (id: string) => {
    const res = await fetch(p("/api/farm/upgrade"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upgradeId: id }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.error);
    fetchState();
  };

  const handleToggle = async (feature: "autoFarmer" | "autoSeller", enabled: boolean) => {
    const res = await fetch(p("/api/farm/toggle"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature, enabled }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.error);
    fetchState();
  };

  const handleToggleAutoFarmerCrop = async (cropType: string | null) => {
    const res = await fetch(p("/api/farm/toggle"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature: "autoFarmerCrop", cropType }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.error);
    fetchState();
  };

  const handleToggleAutoSellerCrop = async (cropType: string, enabled: boolean) => {
    const res = await fetch(p("/api/farm/toggle"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature: "autoSellerCrop", cropType, enabled }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.error);
    fetchState();
  };

  const handleClaimQuest = async (questId: string) => {
    const res = await fetch(p("/api/farm/quests/claim"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questId }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.error);
    if (data.leveledUp) toast.success(`🎉 Level Up! Now Lv.${data.newLevel}`);
    fetchState();
  };

  const handleBuyAnimal = async (animalType: string) => {
    const res = await fetch(p("/api/farm/animals/buy"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animalType }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.error);
    fetchState();
  };

  const handleFeedAnimal = async (animalId: string) => {
    const res = await fetch(p("/api/farm/animals/feed"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animalId }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.error);
    fetchState();
  };

  const handleMixSeeds = async (parent1: string, parent2: string) => {
    const res = await fetch(p("/api/farm/seed-lab/mix"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parent1, parent2 }),
    });
    const data = await res.json();
    if (data.success) {
      setMixResult(data);
      toast.success(data.isNew
        ? `🔬 New hybrid discovered: ${data.hybrid.emoji} ${data.hybrid.name}! +3 seeds`
        : `🧬 Mixed ${data.hybrid.emoji} ${data.hybrid.name}! +3 seeds`);
    } else toast.error(data.error);
    fetchState();
  };

  const handleCollectAnimal = async (animalId: string) => {
    const res = await fetch(p("/api/farm/animals/collect"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animalId }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.error);
    fetchState();
  };

  const handleFulfillTrader = async (traderId: string) => {
    const res = await fetch(p("/api/farm/traders/fulfill"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ traderId }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.error);
    fetchState();
  };

  const handleBackup = async () => {
    try {
      const content = await exportFarms();
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `little-farm-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Backup downloaded. Keep this JSON file somewhere safe!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Backup failed");
    }
  };

  // -- Player selection screen --
  if (!player) {
    return <PlayerSelect onSelect={handleSelectPlayer} />;
  }

  // -- Loading --
  if (loading || !state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 dark:from-emerald-950/55 via-emerald-50/30 dark:via-emerald-950/30 to-amber-50 dark:to-amber-950/55 gap-4">
        {loadError && !loading ? (
          <>
            <span className="text-5xl">⚠️</span>
            <p className="text-amber-800 dark:text-amber-200 font-medium text-center px-4">
              Could not load {player}&apos;s farm.
            </p>
            <p className="text-sm text-muted-foreground text-center px-4 max-w-md">
              {loadError}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setLoading(true); setLoadError(null); retryRef.current = 0; fetchState(true); }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Try Again
              </button>
              <button
                onClick={handleSwitchPlayer}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors text-sm"
              >
                Switch Player
              </button>
            </div>
          </>
        ) : (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-6xl"
            >
              🌻
            </motion.div>
            <span className="text-lg text-amber-800 dark:text-amber-200 font-medium">
              {loadError ? 'Retrying...' : `Loading ${player}&apos;s farm...`}
            </span>
          </>
        )}
      </div>
    );
  }

  // -- Main game --
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 dark:from-emerald-950/55 via-emerald-50/30 dark:via-emerald-950/30 to-amber-50 dark:to-amber-950/55">

      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-green-200/60 dark:border-emerald-800/60 shadow-sm">
        <div className="max-w-2xl mx-auto px-2.5 py-1.5 sm:px-3 sm:py-2.5">
          <FarmHeader
            coins={state.farm.coins}
            level={state.farm.level}
            xpInCurrentLevel={state.farm.xpInCurrentLevel}
            xpNeeded={state.farm.xpNeeded}
            autoFarmerCount={state.farm.autoFarmerCount}
            autoSellerLevel={state.farm.autoSellerLevel}
            autoFarmerEnabled={state.farm.autoFarmerEnabled}
            autoSellerEnabled={state.farm.autoSellerEnabled}
          />
          <div className="flex items-center justify-center gap-3 text-xs">
            <button onClick={handleSwitchPlayer} className="min-w-0 truncate text-muted-foreground hover:text-green-700 dark:hover:text-emerald-300 transition-colors">
              <span className="hidden sm:inline">Playing as <span className="font-semibold text-green-700 dark:text-emerald-300">{player}</span> · Switch Player</span>
              <span className="sm:hidden">👤 {player} · Switch</span>
            </button>
            <button onClick={handleBackup} className="inline-flex items-center gap-1 font-medium text-green-700 dark:text-emerald-300 hover:text-green-900 dark:hover:text-emerald-200" title="Download backup of all farms">
              <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Back up</span><span className="sm:hidden">Save</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full min-w-0 px-2 py-2 sm:px-3 sm:py-3">
        <Tabs defaultValue="farm" className="w-full">
          <TabsList aria-label="Game sections" className="farm-tabs mb-2 flex h-auto w-full max-w-full justify-start gap-1 overflow-x-auto rounded-xl p-1 sm:mb-4 sm:grid sm:grid-cols-7">
            <TabsTrigger value="farm" className="min-w-[72px] shrink-0 flex-col gap-0 px-2 py-1 text-[11px] sm:min-w-0 sm:flex-row sm:gap-1 sm:px-1 sm:text-xs">
              <span>🌾</span>
              <span>Farm</span>
            </TabsTrigger>
            <TabsTrigger value="shop" className="min-w-[72px] shrink-0 flex-col gap-0 px-2 py-1 text-[11px] sm:min-w-0 sm:flex-row sm:gap-1 sm:px-1 sm:text-xs">
              <span>🏪</span>
              <span>Shop</span>
            </TabsTrigger>
            <TabsTrigger value="upgrades" className="min-w-[72px] shrink-0 flex-col gap-0 px-2 py-1 text-[11px] sm:min-w-0 sm:flex-row sm:gap-1 sm:px-1 sm:text-xs">
              <span>🔧</span>
              <span>Upgrades</span>
            </TabsTrigger>
            <TabsTrigger value="quests" className="min-w-[72px] shrink-0 flex-col gap-0 px-2 py-1 text-[11px] sm:min-w-0 sm:flex-row sm:gap-1 sm:px-1 sm:text-xs">
              <span>📜</span>
              <span>Quests</span>
            </TabsTrigger>
            <TabsTrigger value="mastery" className="min-w-[72px] shrink-0 flex-col gap-0 px-2 py-1 text-[11px] sm:min-w-0 sm:flex-row sm:gap-1 sm:px-1 sm:text-xs">
              <span>⭐</span>
              <span>Mastery</span>
            </TabsTrigger>
            <TabsTrigger value="barn" className="min-w-[72px] shrink-0 flex-col gap-0 px-2 py-1 text-[11px] sm:min-w-0 sm:flex-row sm:gap-1 sm:px-1 sm:text-xs">
              <span>🏠</span>
              <span>Barn</span>
            </TabsTrigger>
            <TabsTrigger value="seedlab" className="min-w-[72px] shrink-0 flex-col gap-0 px-2 py-1 text-[11px] sm:min-w-0 sm:flex-row sm:gap-1 sm:px-1 sm:text-xs">
              <span>🧬</span>
              <span>Lab</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="farm">
            <FarmTab
              farm={state.farm}
              plots={state.plots}
              inventory={state.inventory}
              hybridDefs={state.hybridDefs}
              level={state.farm.level}
              selectedSeed={selectedSeed}
              onSelectSeed={setSelectedSeed}
              onHarvest={handleHarvest}
              onPlant={handlePlant}
              onSpray={handleSpray}
              onClear={handleClear}
              onToggle={handleToggle}
              onToggleAutoFarmerCrop={handleToggleAutoFarmerCrop}
              onToggleAutoSellerCrop={handleToggleAutoSellerCrop}
            />
          </TabsContent>

          <TabsContent value="shop">
            <ShopTab
              farm={state.farm}
              inventory={state.inventory}
              market={state.market}
              masteries={state.masteries}
              traders={state.traders}
              onBuy={handleBuy}
              onSell={handleSell}
              onSellProduct={handleSellProduct}
              onFulfillTrader={handleFulfillTrader}
            />
          </TabsContent>

          <TabsContent value="upgrades">
            <UpgradesTab farm={state.farm} onUpgrade={handleUpgrade} />
          </TabsContent>

          <TabsContent value="quests">
            <QuestsTab quests={state.quests} onClaim={handleClaimQuest} />
          </TabsContent>

          <TabsContent value="mastery">
            <MasteryTab
              masteries={state.masteries}
              totalHarvests={state.totalHarvests}
              masteryLevel6Count={state.masteryLevel6Count}
              animalCount={state.animalCount}
              level={state.farm.level}
            />
          </TabsContent>

          <TabsContent value="barn">
            <BarnTab
              level={state.farm.level}
              coins={state.farm.coins}
              inventory={state.inventory}
              animals={state.animals}
              onBuy={handleBuyAnimal}
              onFeed={handleFeedAnimal}
              onCollect={handleCollectAnimal}
            />
          </TabsContent>
          <TabsContent value="seedlab">
            <SeedLabTab
              seedLabUnlocked={state.seedLabUnlocked}
              discoveredHybrids={state.discoveredHybrids}
              hybridDefs={state.hybridDefs}
              masteries={state.masteries}
              inventory={state.inventory}
              coins={state.farm.coins}
              onMix={handleMixSeeds}
            />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-auto hidden border-t border-green-200/60 dark:border-emerald-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm sm:block">
        <div className="max-w-2xl mx-auto px-3 py-2.5 text-center text-xs text-muted-foreground">
          Little Farm Simulator · Crops grow while you are away 🌱
        </div>
      </footer>

      <Modals
        offlineProgress={offlineData}
        dailyBonus={dailyData}
        onDismissOffline={() => { setShowOffline(false); setOfflineData(null); }}
        onDismissDaily={() => { setShowDaily(false); setDailyData(null); }}
      />
    </div>
  );
}
