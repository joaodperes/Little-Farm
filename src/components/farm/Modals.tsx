"use client";

import React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Gift } from "lucide-react";
import { formatElapsed } from "@/lib/game-data";

type OfflineProgress = {
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
};

type DailyBonus = {
  seeds: { cropType: string; crop: { id: string; name: string; emoji: string }; quantity: number }[];
  coins: number;
};

interface ModalsProps {
  offlineProgress: OfflineProgress | null;
  dailyBonus: DailyBonus | null;
  onDismissOffline: () => void;
  onDismissDaily: () => void;
}

export function OfflineModal({ offlineProgress, onDismissOffline }: { offlineProgress: OfflineProgress; onDismissOffline: () => void }) {
  const hasAutoStats = (offlineProgress.autoHarvested ?? 0) > 0;
  const hasCropsReady = offlineProgress.cropsReady && offlineProgress.cropsReady.length > 0;
  const hasWithered = offlineProgress.cropsWithered && offlineProgress.cropsWithered.length > 0;
  const hasPests = offlineProgress.pestAttacks && offlineProgress.pestAttacks.length > 0;
  const marketChanged = offlineProgress.marketChanges > 0;

  return (
    <Dialog open onOpenChange={(o) => !o && onDismissOffline()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>🌾 Welcome Back!</DialogTitle>
          <DialogDescription>You were away for {formatElapsed(offlineProgress.totalElapsed)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {hasAutoStats && (
            <div className="rounded-lg bg-green-50 dark:bg-emerald-950/45 border border-green-200 dark:border-emerald-800 p-3 space-y-1.5">
              <div className="font-medium text-sm text-green-800 dark:text-emerald-200">
                🤖 Auto-farmers worked through {offlineProgress.autoCycles} cycle{offlineProgress.autoCycles !== 1 ? "s" : ""}
              </div>
              <div className="text-xs text-green-700 dark:text-emerald-300">
                Harvested {offlineProgress.autoHarvested} crop{offlineProgress.autoHarvested !== 1 ? "s" : ""}
                {offlineProgress.autoPlanted ? ` · Planted ${offlineProgress.autoPlanted} new` : ""}
              </div>
              {(offlineProgress.autoCoinsEarned ?? 0) > 0 && (
                <div className="text-xs text-green-700 dark:text-emerald-300">
                  💰 Auto-seller earned {offlineProgress.autoCoinsEarned} coins
                </div>
              )}
              {(offlineProgress.autoWithered ?? 0) > 0 && (
                <div className="text-xs text-red-600 dark:text-rose-400">
                  {offlineProgress.autoWithered} crop{offlineProgress.autoWithered !== 1 ? "s" : ""} withered before farmers could harvest
                </div>
              )}
            </div>
          )}
          {hasCropsReady && (
            <div className="rounded-lg bg-green-50 dark:bg-emerald-950/45 border border-green-200 dark:border-emerald-800 p-3">
              <div className="font-medium text-sm text-green-800 dark:text-emerald-200">
                {offlineProgress.cropsReady.length} crop{offlineProgress.cropsReady.length !== 1 ? "s" : ""} ready to harvest!
              </div>
            </div>
          )}
          {hasWithered && (
            <div className="rounded-lg bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 p-3">
              <div className="font-medium text-sm text-gray-700 dark:text-slate-300">
                {offlineProgress.cropsWithered.length} crop{offlineProgress.cropsWithered.length !== 1 ? "s" : ""} withered
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Upgrade Storage House to extend wither time.</div>
            </div>
          )}
          {hasPests && (
            <div className="rounded-lg bg-red-50 dark:bg-rose-950/45 border border-red-200 dark:border-rose-800 p-3">
              <div className="font-medium text-sm text-red-700 dark:text-rose-300">
                🐛 {offlineProgress.pestAttacks.length} pest attack{offlineProgress.pestAttacks.length !== 1 ? "s" : ""}!
              </div>
              <div className="text-xs text-red-600 dark:text-rose-400">Use 💊 medicine from your Storage House to cure them.</div>
            </div>
          )}
          {marketChanged && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/45 border border-amber-200 dark:border-amber-800 p-3">
              <div className="font-medium text-sm text-amber-800 dark:text-amber-200 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> Market prices have changed!
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400">Check the shop for new prices.</div>
            </div>
          )}
          {!hasAutoStats && !hasCropsReady && !hasWithered && !hasPests && !marketChanged && (
            <div className="rounded-lg bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 p-3">
              <div className="text-sm text-gray-600 dark:text-slate-400">Nothing happened while you were away.</div>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onDismissOffline}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          >
            Continue
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DailyBonusModal({ dailyBonus, onDismissDaily }: { dailyBonus: DailyBonus; onDismissDaily: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onDismissDaily()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>🎁 Daily Seed Bag!</DialogTitle>
          <DialogDescription>Your daily farming supplies have arrived.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/45 border border-amber-200 dark:border-amber-800 p-3">
            <div className="font-medium text-sm text-amber-800 dark:text-amber-200">
              +{dailyBonus.coins}🪙 coins
            </div>
          </div>
          {dailyBonus.seeds.length > 0 && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/45 border border-emerald-200 dark:border-emerald-800 p-3">
              <div className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2">Seeds received:</div>
              <div className="flex flex-wrap gap-1.5">
                {dailyBonus.seeds.map((s) => (
                  <Badge key={s.cropType} variant="outline" className="bg-white dark:bg-slate-900">
                    {s.crop.emoji} {s.crop.name} ×{s.quantity}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onDismissDaily}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          >
            Thanks!
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Modals({ offlineProgress, dailyBonus, onDismissOffline, onDismissDaily }: ModalsProps) {
  return (
    <>
      {offlineProgress && (
        <OfflineModal offlineProgress={offlineProgress} onDismissOffline={onDismissOffline} />
      )}
      {dailyBonus && (
        <DailyBonusModal dailyBonus={dailyBonus} onDismissDaily={onDismissDaily} />
      )}
    </>
  );
}
