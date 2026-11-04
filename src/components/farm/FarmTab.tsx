"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Sprout, Lock, Bot, Banknote, Info } from "lucide-react";
import {
  CROPS, FARM_COLS, formatDuration, isCropUnlocked,
  getCropTierColor, getHybridAsCropDef, type CropDef, type HybridCropDef,
} from "@/lib/game-data";
import { toast } from "sonner";

const sortedCropEntries = (Object.entries(CROPS) as [string, CropDef][]).sort(
  ([, a], [, b]) => a.tier - b.tier || a.growthTimeSec - b.growthTimeSec
);

const tierColors: Record<number, string> = {
  1: "border-green-300 bg-green-50/50",
  2: "border-emerald-300 bg-emerald-50/50",
  3: "border-teal-300 bg-teal-50/50",
  4: "border-amber-300 bg-amber-50/50",
  5: "border-orange-300 bg-orange-50/50",
  6: "border-red-300 bg-red-50/50",
};

interface FarmTabProps {
  farm: {
    farmRows: number;
    farmCols: number;
    autoFarmerCount: number;
    autoSellerLevel: number;
    autoFarmerEnabled: boolean;
    autoSellerEnabled: boolean;
    autoFarmerCrop: string | null;
    autoSellerCrops: string;
    medicineCount: number;
    medicineMax: number;
    medicineNextRefillSec: number;
  };
  plots: Array<{
    id: string; row: number; col: number;
    cropType: string | null; state: string;
    emoji: string; growthPercent: number; cropName: string; timeRemaining: number;
  }>;
  inventory: Record<string, number>;
  hybridDefs: Record<string, HybridCropDef>;
  level: number;
  selectedSeed: string | null;
  onSelectSeed: (id: string | null) => void;
  onHarvest: (plotId: string) => void;
  onPlant: (plotId: string, cropType: string) => void;
  onSpray: (plotId: string) => void;
  onToggle: (feature: "autoFarmer" | "autoSeller", enabled: boolean) => void;
  onToggleAutoFarmerCrop: (cropType: string | null) => void;
  onToggleAutoSellerCrop: (cropType: string, enabled: boolean) => void;
}

export default function FarmTab({
  farm, plots, inventory, hybridDefs, level, selectedSeed, onSelectSeed,
  onHarvest, onPlant, onSpray, onToggle,
  onToggleAutoFarmerCrop, onToggleAutoSellerCrop,
}: FarmTabProps) {
  const plantingMode = selectedSeed !== null;
  const allSeedEntries: [string, CropDef][] = [...sortedCropEntries, ...Object.values(hybridDefs).map(h => [h.id, getHybridAsCropDef(h)] as [string, CropDef])];

  // Parse auto-seller crops
  let autoSellerCropsList: string[] = [];
  try { autoSellerCropsList = JSON.parse(farm.autoSellerCrops); } catch { autoSellerCropsList = []; }

  // Get unlocked crops that have seeds for auto-farmer selector
  const availableCropsForFarmer = sortedCropEntries
    .filter(([id, crop]) => isCropUnlocked(crop, level) && (inventory[`seed_${id}`] ?? 0) > 0);

  // Get unlocked crops for auto-seller selector (any unlocked crop, not just those with inventory)
  const availableCropsForSeller = sortedCropEntries
    .filter(([, crop]) => isCropUnlocked(crop, level));

  const handlePlotClick = (plot: typeof plots[0]) => {
    if (plot.state === "mature") {
      onHarvest(plot.id);
    } else if (plot.state === "pest") {
      onSpray(plot.id);
    } else if (plot.state === "withered") {
      onHarvest(plot.id);
    } else if (plot.state === "empty" && plantingMode && selectedSeed) {
      onPlant(plot.id, selectedSeed);
    } else if (plot.state === "empty") {
      toast.info("Select a seed from your pouch first!");
    }
  };

  const sortedPlots = [...plots].sort(
    (a, b) => a.row * FARM_COLS + a.col - (b.row * FARM_COLS + b.col)
  );

  return (
    <div className="space-y-3">
      {/* Seed Pouch */}
      <Card className="border-green-200 bg-white/70 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sprout className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Seed Pouch
            </span>
            <span className="text-xs text-muted-foreground">
              {plantingMode
                ? "Click an empty plot to plant"
                : "Select a seed to start planting"}
            </span>
            {plantingMode && (
              <button
                className="ml-auto text-xs text-red-500 hover:text-red-700 underline"
                onClick={() => onSelectSeed(null)}
              >
                Cancel
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
            {allSeedEntries.map(([id, crop]) => {
              const count = inventory[`seed_${id}`] ?? 0;
              const isSelected = selectedSeed === id;
              const unlocked = isCropUnlocked(crop, level);
              const canSelect = unlocked && count > 0;
              return (
                <motion.button
                  key={id}
                  whileHover={{ scale: canSelect ? 1.05 : 1 }}
                  whileTap={{ scale: canSelect ? 0.95 : 1 }}
                  onClick={() =>
                    canSelect
                      ? onSelectSeed(isSelected ? null : id)
                      : !unlocked
                        ? toast.info(`${crop.emoji} ${crop.name} unlocks at Lv.${crop.requiredLevel}`)
                        : toast.info(`No ${crop.name} seeds – buy some in the Shop!`)
                  }
                  className={`relative flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-green-500 bg-green-50 shadow-md"
                      : canSelect
                        ? "border-green-200 bg-white hover:border-green-300 hover:bg-green-50/50"
                        : !unlocked
                          ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                          : "border-gray-200 bg-gray-50/50 cursor-not-allowed"
                  }`}
                >
                  <span className="text-lg leading-none">
                    {unlocked ? crop.emoji : "🔒"}
                  </span>
                  <span className={`text-[10px] leading-tight text-center truncate w-full ${canSelect ? "text-green-700" : "text-gray-400"}`}>
                    {crop.name}
                  </span>
                  {unlocked ? (
                    <span className={`text-[10px] font-bold ${count > 0 ? "text-amber-700" : "text-gray-400"}`}>
                      ×{count}
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                      <Lock className="w-2.5 h-2.5" />
                      Lv.{crop.requiredLevel}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Farm Grid */}
      <Card className="border-green-200 bg-gradient-to-br from-amber-50/50 via-green-50/30 to-emerald-50/50 overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <div
            className="grid gap-1.5 sm:gap-2"
            style={{
              gridTemplateColumns: `repeat(${farm.farmCols}, 1fr)`,
            }}
          >
            <AnimatePresence>
              {sortedPlots.map((plot, idx) => {
                const isEmpty = plot.state === "empty";
                const isMature = plot.state === "mature";
                const isWithered = plot.state === "withered";
                const isGrowing = plot.state === "growing";
                const isPest = plot.state === "pest";

                return (
                  <motion.div
                    key={plot.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      ...(isPest ? { x: [0, -3, 3, -3, 3, 0] } : {}),
                    }}
                    transition={{
                      delay: idx * 0.02,
                      ...(isPest
                        ? { x: { duration: 0.4, repeat: Infinity, repeatDelay: 1.5 } }
                        : {}),
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePlotClick(plot)}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 overflow-hidden ${
                      isEmpty
                        ? plantingMode && selectedSeed
                          ? "border-dashed border-green-400 bg-amber-100/60 hover:bg-green-100/60 hover:border-green-500 shadow-sm"
                          : "border-dashed border-amber-300 bg-amber-100/40"
                        : isMature
                          ? "border-yellow-400 bg-yellow-50 shadow-md hover:shadow-lg hover:border-yellow-500"
                          : isWithered
                            ? "border-gray-400 bg-gray-100 hover:border-gray-500"
                            : isPest
                              ? "border-red-500 bg-red-50 hover:border-red-600"
                              : "border-green-300 bg-green-50/50"
                    }`}
                  >
                    {/* Mature golden glow */}
                    {isMature && (
                      <motion.div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        animate={{
                          boxShadow: [
                            "0 0 6px rgba(234,179,8,0.2), inset 0 0 6px rgba(234,179,8,0.1)",
                            "0 0 18px rgba(234,179,8,0.5), inset 0 0 10px rgba(234,179,8,0.15)",
                            "0 0 6px rgba(234,179,8,0.2), inset 0 0 6px rgba(234,179,8,0.1)",
                          ],
                        }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}

                    {/* Emoji */}
                    <motion.span
                      key={plot.emoji}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="text-2xl sm:text-3xl select-none relative z-10"
                    >
                      {plot.emoji}
                    </motion.span>

                    {/* Progress bar for growing */}
                    {isGrowing && (
                      <div className="w-full px-1 mt-0.5 relative z-10">
                        <div className="h-1.5 bg-green-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${plot.growthPercent}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[9px] sm:text-[10px] text-green-600 font-semibold">
                            {Math.round(plot.growthPercent)}%
                          </span>
                          {plot.timeRemaining > 0 && (
                            <span className="text-[9px] sm:text-[10px] text-green-500">
                              {formatDuration(plot.timeRemaining)}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-green-600 font-medium block text-center truncate">
                          {plot.cropName}
                        </span>
                      </div>
                    )}

                    {/* Labels */}
                    {isEmpty && plantingMode && selectedSeed && (
                      <span className="text-[10px] text-green-600 font-bold mt-0.5 relative z-10">
                        Plant
                      </span>
                    )}
                    {isMature && (
                      <span className="text-[10px] text-yellow-700 font-bold mt-0.5 relative z-10">
                        Harvest!
                      </span>
                    )}
                    {isWithered && (
                      <span className="text-[10px] text-gray-500 font-bold mt-0.5 relative z-10">
                        Clear
                      </span>
                    )}
                    {isPest && (
                      <span className="text-[10px] text-red-600 font-bold mt-0.5 relative z-10">
                        {farm.medicineCount > 0 ? "Cure 💊" : "No 💊!"}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Legend & Auto Toggles */}
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground items-center">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded border-2 border-dashed border-amber-300 bg-amber-100/40" />
                Empty
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded border-2 border-green-300 bg-green-50" />
                Growing
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded border-2 border-yellow-400 bg-yellow-50" />
                Ready
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded border-2 border-gray-400 bg-gray-100" />
                Withered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded border-2 border-red-500 bg-red-50" />
                Pest
                <span className="relative group">
                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1.5 bg-gray-900 text-white text-[9px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                    Pests strike growing crops every ~1min (0.4% chance per plot, reduced by Pesticide upgrade). Cure with 💊 medicine from Storage House!
                  </span>
                </span>
              </span>
              {farm.medicineMax > 0 && (
                <span className="flex items-center gap-1 font-medium" title={farm.medicineNextRefillSec > 0 && farm.medicineCount < farm.medicineMax ? `Next in ${formatDuration(Math.ceil(farm.medicineNextRefillSec))}` : farm.medicineCount >= farm.medicineMax ? 'Full!' : 'Increase Storage House level'}>
                  💊 <span className={farm.medicineCount > 0 ? "text-emerald-600" : "text-red-500"}>{farm.medicineCount}/{farm.medicineMax}</span>
                  {farm.medicineNextRefillSec > 0 && farm.medicineCount < farm.medicineMax && (
                    <span className="text-[9px] text-muted-foreground">({formatDuration(Math.ceil(farm.medicineNextRefillSec))})</span>
                  )}
                </span>
              )}
              {farm.autoFarmerCount > 0 && (
                <span className={`text-emerald-600 font-medium ml-auto ${!farm.autoFarmerEnabled ? "line-through opacity-50" : ""}`}>
                  <Bot className="w-3 h-3 inline mr-0.5" />
                  {farm.autoFarmerCount} auto farmer{farm.autoFarmerCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Auto Toggles */}
            {(farm.autoFarmerCount > 0 || farm.autoSellerLevel > 0) && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {farm.autoFarmerCount > 0 && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                      <Bot className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700">Auto Farmer</span>
                      <Switch
                        checked={farm.autoFarmerEnabled}
                        onCheckedChange={(checked) => onToggle("autoFarmer", checked)}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                  )}
                  {farm.autoSellerLevel > 0 && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                      <Banknote className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-xs font-medium text-amber-700">Auto Seller</span>
                      <Switch
                        checked={farm.autoSellerEnabled}
                        onCheckedChange={(checked) => onToggle("autoSeller", checked)}
                        className="data-[state=checked]:bg-amber-600"
                      />
                    </div>
                  )}
                  <span className="text-[10px] text-muted-foreground self-center">
                    {farm.autoFarmerEnabled && farm.autoSellerEnabled
                      ? "Farmers use seeds from your inventory (never buy from shop)"
                      : "Toggles bypassed while offline"}
                  </span>
                </div>

                {/* Auto Farmer Crop Selector */}
                {farm.autoFarmerCount > 0 && (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-2.5">
                    <div className="text-[10px] text-emerald-600 font-medium mb-1.5">🌱 Plant target:</div>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => onToggleAutoFarmerCrop(null)}
                        className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-all ${
                          !farm.autoFarmerCrop
                            ? "border-emerald-400 bg-emerald-100 text-emerald-800 shadow-sm"
                            : "border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        Cheapest
                      </button>
                      {availableCropsForFarmer.map(([id, crop]) => (
                        <button
                          key={id}
                          onClick={() => onToggleAutoFarmerCrop(id)}
                          className={`flex items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-medium border transition-all ${
                            farm.autoFarmerCrop === id
                              ? "border-emerald-400 bg-emerald-100 text-emerald-800 shadow-sm"
                              : "border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {crop.emoji} {crop.name}
                        </button>
                      ))}
                    </div>
                    {farm.autoFarmerCrop && (
                      <div className="text-[9px] text-emerald-500 mt-1">
                        Falls back to cheapest if no seeds available
                      </div>
                    )}
                  </div>
                )}

                {/* Auto Seller Crop Selector */}
                {farm.autoSellerLevel > 0 && (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-2.5">
                    <div className="text-[10px] text-amber-600 font-medium mb-1.5">💰 Sell targets:</div>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => {
                          // Clear allowlist = sell all
                          for (const c of autoSellerCropsList) {
                            onToggleAutoSellerCrop(c, false);
                          }
                        }}
                        className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-all ${
                          autoSellerCropsList.length === 0
                            ? "border-amber-400 bg-amber-100 text-amber-800 shadow-sm"
                            : "border-amber-200 bg-white text-amber-600 hover:bg-amber-50"
                        }`}
                      >
                        All
                      </button>
                      {availableCropsForSeller.map(([id, crop]) => {
                        const isInList = autoSellerCropsList.includes(id);
                        return (
                          <button
                            key={id}
                            onClick={() => onToggleAutoSellerCrop(id, !isInList)}
                            className={`flex items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-medium border transition-all ${
                              isInList
                                ? "border-amber-400 bg-amber-100 text-amber-800 shadow-sm"
                                : "border-amber-200 bg-white text-amber-600 hover:bg-amber-50"
                            }`}
                          >
                            {crop.emoji} {crop.name}
                          </button>
                        );
                      })}
                    </div>
                    {autoSellerCropsList.length > 0 && (
                      <div className="text-[9px] text-amber-500 mt-1">
                        Only selling {autoSellerCropsList.length} selected crop{autoSellerCropsList.length > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
