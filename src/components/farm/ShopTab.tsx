"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Store, TrendingUp, TrendingDown, Minus, Lock, Check, Package } from "lucide-react";
import {
  CROPS, ANIMALS, getCropSellPriceWithMastery, getCropSellPrice,
  getCropTierLabel, getCropTierColor, isCropUnlocked, calculateTraderMarketValue,
  formatDuration,
  type MarketData, type CropDef, type SpecialTrader,
} from "@/lib/game-data";

// Sorted crops list
const sortedCropEntries = (Object.entries(CROPS) as [string, CropDef][]).sort(
  ([, a], [, b]) => a.tier - b.tier || a.growthTimeSec - b.growthTimeSec
);

interface ShopTabProps {
  farm: { coins: number; level: number; speedLevel: number };
  inventory: Record<string, number>;
  market: MarketData;
  masteries: Record<string, { harvestCount: number; masteryLevel: number; rank: string }>;
  traders: SpecialTrader[];
  onBuy: (cropType: string, quantity: number) => void;
  onSell: (cropType: string, quantity: number) => void;
  onSellProduct: (itemType: string, quantity: number) => void;
  onFulfillTrader: (traderId: string) => void;
}

export default function ShopTab({
  farm, inventory, market, masteries, traders, onBuy, onSell, onSellProduct, onFulfillTrader,
}: ShopTabProps) {
  const [buyQty, setBuyQty] = useState<Record<string, number>>({});
  const [sellQty, setSellQty] = useState<Record<string, number>>({});
  const [mobileSection, setMobileSection] = useState<"seeds" | "sell" | "traders" | "market">("seeds");
  const [showLockedSeeds, setShowLockedSeeds] = useState(false);
  const [seedSearch, setSeedSearch] = useState("");

  const demandIcon = (trend: string, demand: number) => {
    if (trend === "up" || demand > 1.1) return <TrendingUp className="h-3 w-3 text-green-600 dark:text-emerald-400" />;
    if (trend === "down" || demand < 0.9) return <TrendingDown className="h-3 w-3 text-red-500 dark:text-rose-400" />;
    return <Minus className="h-3 w-3 text-gray-400 dark:text-slate-400" />;
  };

  const harvestedCrops = useMemo(
    () =>
      Object.entries(inventory)
        .filter(([key, qty]) => key.startsWith("crop_") && qty > 0)
        .map(([key, qty]) => {
          const cropType = key.replace("crop_", "");
          const crop = CROPS[cropType];
          return { cropType, crop, quantity: qty };
        })
        .filter((c) => c.crop),
    [inventory]
  );

  const productEntries = Object.entries(inventory).filter(
    ([k, v]) => k.startsWith("product_") && v > 0
  );

  const getProductInfo = (key: string) => {
    const name = key.replace("product_", "");
    return Object.values(ANIMALS).find(
      (a) => a.productName.toLowerCase() === name
    );
  };

  // Trader helpers
  const canFulfillTrader = (trader: SpecialTrader) => {
    if (trader.fulfilled) return false;
    for (const req of trader.items) {
      const have = inventory[`crop_${req.cropType}`] ?? 0;
      if (have < req.quantity) return false;
    }
    return true;
  };

  const getTraderItemStatus = (trader: SpecialTrader) => {
    const statuses: { cropType: string; have: number; need: number }[] = [];
    for (const req of trader.items) {
      statuses.push({
        cropType: req.cropType,
        have: inventory[`crop_${req.cropType}`] ?? 0,
        need: req.quantity,
      });
    }
    return statuses;
  };

  const visibleSeeds = sortedCropEntries.filter(([, crop]) =>
    (showLockedSeeds || isCropUnlocked(crop, farm.level)) &&
    crop.name.toLowerCase().includes(seedSearch.trim().toLowerCase())
  );

  return (
    <div className="space-y-3">
      <nav aria-label="Shop sections" className="grid grid-cols-4 gap-1 rounded-xl border border-border bg-card/90 p-1 sm:hidden">
        {([
          ["seeds", "🌱", "Buy"],
          ["sell", "🪙", "Sell"],
          ["traders", "📦", "Traders"],
          ["market", "📊", "Prices"],
        ] as const).map(([id, emoji, label]) => (
          <button key={id} type="button" onClick={() => setMobileSection(id)} aria-current={mobileSection === id ? "page" : undefined}
            className={`flex min-h-11 flex-col items-center justify-center rounded-lg px-1 py-1 text-[11px] font-semibold transition-colors ${mobileSection === id ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted"}`}>
            <span className="text-base leading-none" aria-hidden="true">{emoji}</span>{label}
          </button>
        ))}
      </nav>
      <section aria-label="Special traders" className={mobileSection === "traders" ? "space-y-3" : "hidden space-y-3 sm:block"}>
      {/* Special Traders */}
      <Card className="border-purple-200 dark:border-violet-800 bg-gradient-to-br from-purple-50/80 dark:from-violet-950/80 to-amber-50/50 dark:to-amber-950/50 backdrop-blur-sm">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-purple-800 dark:text-violet-200">
            <Package className="h-4 w-4" />
            Special Traders
            <span className="text-xs font-normal text-muted-foreground">
              (rotates daily · sell above market rate!)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {traders.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No traders visiting today. Check back tomorrow!
            </p>
          ) : (
            <div className="space-y-2">
              {traders.map((trader) => {
                const itemStatuses = getTraderItemStatus(trader);
                const canFulfill = canFulfillTrader(trader);
                const marketValue = calculateTraderMarketValue(trader.items, market);
                const bonus = trader.totalReward - marketValue;

                return (
                  <Card
                    key={trader.id}
                    className={`border backdrop-blur-sm overflow-hidden transition-all ${
                      trader.fulfilled
                        ? "border-green-200 dark:border-emerald-800 bg-green-50/50 dark:bg-emerald-950/50 opacity-70"
                        : canFulfill
                          ? "border-purple-300 dark:border-violet-800 bg-white/90 dark:bg-slate-900/90 shadow-sm"
                          : "border-gray-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60"
                    }`}
                  >
                    <CardContent className="p-3">
                      {/* Header */}
                      <div className="flex items-start gap-2">
                        <span className="text-2xl shrink-0">{trader.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className={`font-bold text-sm ${trader.fulfilled ? "text-green-700 dark:text-emerald-300" : "text-purple-800 dark:text-violet-200"}`}>
                              {trader.name}
                            </h3>
                            {trader.fulfilled && (
                              <Badge className="text-[10px] bg-green-100 dark:bg-emerald-950/45 text-green-700 dark:text-emerald-300 border-green-300 dark:border-emerald-800">
                                <Check className="h-2.5 w-2.5 mr-0.5" /> Fulfilled
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 shrink-0 ${
                                trader.fulfilled ? "border-green-300 dark:border-emerald-800 text-green-600 dark:text-emerald-400" : "border-purple-300 dark:border-violet-800 text-purple-600 dark:text-violet-400"
                              }`}
                            >
                              +{Math.round((trader.premiumRate - 1) * 100)}% premium
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground italic mt-0.5">
                            &ldquo;{trader.flavorText}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* Order items */}
                      <div className="mt-2 space-y-1">
                        {itemStatuses.map(({ cropType, have, need }) => {
                          const crop = CROPS[cropType];
                          const met = have >= need;
                          return (
                            <div
                              key={cropType}
                              className={`flex items-center gap-2 text-xs px-2 py-1 rounded-md ${
                                trader.fulfilled ? "bg-green-100/50 dark:bg-emerald-950/50" : met ? "bg-emerald-50 dark:bg-emerald-950/45" : "bg-red-50 dark:bg-rose-950/45"
                              }`}
                            >
                              <span>{crop?.emoji ?? "?"}</span>
                              <span className={met ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-rose-300"}>
                                {crop?.name ?? cropType}
                              </span>
                              <span className="flex-1" />
                              <span className={`font-mono font-medium ${met ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-rose-400"}`}>
                                {Math.min(have, need)}/{need}
                              </span>
                              {met && !trader.fulfilled && <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer: reward + button */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold">
                            Reward: {trader.totalReward} 🪙
                          </p>
                          {!trader.fulfilled && bonus > 0 && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              +{bonus}🪙 above current market prices
                            </p>
                          )}
                        </div>
                        {trader.fulfilled ? (
                          <div className="flex items-center gap-1 text-green-600 dark:text-emerald-400 text-xs font-medium">
                            <Check className="h-3.5 w-3.5" /> Done
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            disabled={!canFulfill}
                            className={`text-xs h-7 ${
                              canFulfill
                                ? "bg-purple-600 hover:bg-purple-700 text-white"
                                : "bg-gray-200 dark:bg-slate-700/40 text-gray-500 dark:text-slate-400"
                            }`}
                            onClick={() => onFulfillTrader(trader.id)}
                          >
                            Fulfill
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          {traders.length > 0 && (
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              🕐 New traders arrive every day · Must meet exact quantities
            </p>
          )}
        </CardContent>
      </Card>
      </section>

      <section aria-label="Market prices" className={mobileSection === "market" ? "space-y-3" : "hidden space-y-3 sm:block"}>
      {/* Market Overview */}
      <Card className="border-blue-200 dark:border-sky-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            📊 Market{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (updates every 5min)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="space-y-1">
            {sortedCropEntries.map(([id, crop]) => {
              const md = market[id];
              const demand = md?.demand ?? 1;
              const trend = md?.trend ?? "stable";
              const sellPrice = getCropSellPrice(id, demand);
              const isHigh = demand > 1.3;
              const isLow = demand < 0.8;
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 text-xs py-1"
                >
                  <span className="w-5 text-center text-sm">{crop.emoji}</span>
                  <span
                    className={`w-20 sm:w-24 truncate font-medium ${isHigh ? "text-green-700 dark:text-emerald-300" : isLow ? "text-red-600 dark:text-rose-400" : "text-foreground"}`}
                  >
                    {crop.name}
                  </span>
                  <span className="flex-1" />
                  <span
                    className={`font-mono text-[11px] ${isHigh ? "text-green-600 dark:text-emerald-400 font-bold" : isLow ? "text-red-500 dark:text-rose-400 font-bold" : "text-muted-foreground"}`}
                  >
                    {demand.toFixed(2)}×
                  </span>
                  {demandIcon(trend, demand)}
                  <span className="w-14 text-right font-medium text-amber-700 dark:text-amber-300">
                    {sellPrice} 🪙
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      </section>

      <section aria-label="Buy seeds" className={mobileSection === "seeds" ? "space-y-2" : "hidden space-y-2 sm:block"}>
      {/* Buy Seeds */}
      <h2 className="text-base font-bold text-green-800 dark:text-emerald-200 flex items-center gap-2">
        🌱 Buy Seeds
      </h2>
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-card/70 p-2">
        <label className="sr-only" htmlFor="shop-seed-search">Search seeds</label>
        <input id="shop-seed-search" type="search" value={seedSearch} onChange={(event) => setSeedSearch(event.target.value)}
          placeholder="Find a seed…" className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground" />
        <button type="button" onClick={() => setShowLockedSeeds((current) => !current)}
          className="min-h-9 rounded-md border border-border px-2 text-xs font-medium text-foreground hover:bg-muted"
          aria-pressed={showLockedSeeds}>{showLockedSeeds ? "Hide locked" : "Show locked"}</button>
      </div>
      <div className="grid gap-1.5 grid-cols-2 sm:grid-cols-3 sm:gap-2">
        {visibleSeeds.map(([id, crop]) => {
          const unlocked = isCropUnlocked(crop, farm.level);
          const qty = buyQty[id] || 1;
          const totalCost = crop.seedCost * qty;
          const owned = inventory[`seed_${id}`] ?? 0;
          const tierLabel = getCropTierLabel(crop.tier);
          const tierColor = getCropTierColor(crop.tier);

          return (
            <Card
              key={id}
              className={`border bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm overflow-hidden transition-opacity ${unlocked ? "border-green-200 dark:border-emerald-800" : "border-gray-200 dark:border-slate-800 opacity-60"}`}
            >
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <div className="text-xl sm:text-3xl shrink-0">{crop.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className={`font-bold text-sm truncate ${unlocked ? "text-green-800 dark:text-emerald-200" : "text-gray-500 dark:text-slate-400"}`}>
                        {crop.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${tierColor} border-current/30 shrink-0`}
                      >
                        {tierLabel}
                      </Badge>
                    </div>
                    <p className="hidden sm:block text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                      {crop.description}
                    </p>
                    <div className="hidden sm:flex mt-1.5 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                      <span className="text-muted-foreground">⏱ {formatDuration(crop.growthTimeSec)}</span>
                      <span className="text-amber-600 dark:text-amber-400">{crop.seedCost}🪙</span>
                      <span className="text-emerald-600 dark:text-emerald-400">+{crop.xpReward} XP</span>
                    </div>
                    <Separator className="my-1.5 sm:my-2" />
                    {unlocked ? (
                      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                        <div className="flex items-center border border-green-200 dark:border-emerald-800 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setBuyQty((p) => ({ ...p, [id]: Math.max(1, (p[id] || 1) - 1) }))}
                            className="w-6 sm:w-7 h-7 flex items-center justify-center text-green-700 dark:text-emerald-300 hover:bg-green-100 dark:hover:bg-emerald-950/45 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 sm:w-7 text-center text-sm font-bold text-green-800 dark:text-emerald-200">{qty}</span>
                          <button
                            onClick={() => setBuyQty((p) => ({ ...p, [id]: (p[id] || 1) + 1 }))}
                            className="w-6 sm:w-7 h-7 flex items-center justify-center text-green-700 dark:text-emerald-300 hover:bg-green-100 dark:hover:bg-emerald-950/45 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => { onBuy(id, qty); setBuyQty((p) => ({ ...p, [id]: 1 })); }}
                          disabled={farm.coins < totalCost}
                          className="flex-1 min-w-0 px-1 bg-green-600 hover:bg-green-700 text-white text-xs h-7"
                        >
                          Buy {totalCost}🪙
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Reach <strong>Lv.{crop.requiredLevel}</strong> to unlock</span>
                      </div>
                    )}
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Owned: {owned} seed{owned !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {visibleSeeds.length === 0 && <p className="rounded-lg border border-border p-5 text-center text-sm text-muted-foreground">No seeds match your filters.</p>}
      </section>

      <section aria-label="Sell crops and products" className={mobileSection === "sell" ? "space-y-3" : "hidden space-y-3 sm:block"}>
      {/* Sell Harvested Crops */}
      <h2 className="text-base font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
        💰 Sell Harvested Crops
        {harvestedCrops.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto text-xs border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/45 h-7"
            onClick={() => harvestedCrops.forEach((c) => onSell(c.cropType, c.quantity))}
          >
            Sell All
          </Button>
        )}
      </h2>
      {harvestedCrops.length === 0 ? (
        <Card className="border-amber-200 dark:border-amber-800 bg-white/70 dark:bg-slate-900/70">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No harvested crops yet. Plant and harvest some crops!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {harvestedCrops.map(({ cropType, crop, quantity }) => {
            const qty = Math.min(sellQty[cropType] || 1, quantity);
            const md = market[cropType];
            const demand = md?.demand ?? 1;
            const trend = md?.trend ?? "stable";
            const ml = masteries[cropType]?.masteryLevel ?? 0;
            const unitPrice = getCropSellPriceWithMastery(cropType, demand, ml);
            const basePrice = getCropSellPrice(cropType, demand);
            const totalPrice = unitPrice * qty;
            return (
              <Card
                key={cropType}
                className="border-amber-200 dark:border-amber-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm"
              >
                <CardContent className="p-2 sm:p-3">
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl shrink-0">{crop.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                          {crop.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-amber-100 dark:bg-amber-950/45 text-amber-700 dark:text-amber-300"
                        >
                          ×{quantity}
                        </Badge>
                        {demandIcon(trend, demand)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {unitPrice} 🪙 each · {demand.toFixed(2)}× demand
                        {ml > 0 && (
                          <span className="text-emerald-600 dark:text-emerald-400 ml-1">(+{ml * 3}% mastery)</span>
                        )}
                      </p>
                    </div>
                    <div className="flex w-full sm:w-auto items-center justify-end gap-1.5 shrink-0">
                      <div className="flex items-center border border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setSellQty((p) => ({ ...p, [cropType]: Math.max(1, (p[cropType] || 1) - 1) }))}
                          className="w-6 h-7 flex items-center justify-center text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/45 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-amber-800 dark:text-amber-200">
                          {qty}
                        </span>
                        <button
                          onClick={() => setSellQty((p) => ({ ...p, [cropType]: Math.min(quantity, (p[cropType] || 1) + 1) }))}
                          className="w-6 h-7 flex items-center justify-center text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/45 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-400 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/45 text-xs h-7"
                        onClick={() => { onSell(cropType, qty); setSellQty((p) => ({ ...p, [cropType]: 1 })); }}
                      >
                        {totalPrice}🪙
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Sell Animal Products */}
      {productEntries.length > 0 && (
        <>
          <h2 className="text-base font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
            🛒 Sell Animal Products
          </h2>
          <div className="space-y-2">
            {productEntries.map(([key, count]) => {
              const animal = getProductInfo(key);
              if (!animal) return null;
              return (
                <Card
                  key={key}
                  className="border-amber-200 dark:border-amber-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm"
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl shrink-0">{animal.productEmoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-amber-800 dark:text-amber-200 text-sm">{animal.productName}</span>
                          <Badge variant="secondary" className="text-[10px] bg-amber-100 dark:bg-amber-950/45 text-amber-700 dark:text-amber-300">
                            ×{count}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {animal.productSellPrice}🪙 each
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-400 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/45 text-xs h-7"
                        onClick={() => onSellProduct(key, count)}
                      >
                        Sell All ({animal.productSellPrice * count}🪙)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
      </section>
    </div>
  );
}
