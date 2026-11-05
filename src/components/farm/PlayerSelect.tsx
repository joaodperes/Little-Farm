"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { User, Plus, LogIn, Trash2, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { listPlayers, deletePlayer, exportFarms, importFarms } from "@/lib/browser-farm";
import ThemeToggle from "@/components/farm/ThemeToggle";

interface PlayerInfo {
  id: string;
  level: number;
  createdAt: string;
  lastOnlineAt: string;
}

interface PlayerSelectProps {
  onSelect: (playerName: string) => void;
}

export default function PlayerSelect({ onSelect }: PlayerSelectProps) {
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try { setPlayers(await listPlayers()); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not access browser storage"); }
    finally { setLoading(false); }
  };

  const handleExport = async () => {
    try {
      const data = await exportFarms();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `little-farm-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Backup downloaded!");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Export failed"); }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (!window.confirm("Import the backup? Profiles with the same name will be replaced. Back up current farms first if needed.")) return;
    try {
      if (file.size > 10_000_000) throw new Error("Save file too large");
      const count = await importFarms(await file.text());
      toast.success(`Imported ${count} farm${count === 1 ? "" : "s"} successfully`);
      await fetchPlayers();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Import failed"); }
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    if (name.length > 20) return;
    // Allow letters (including Unicode), digits, hyphens, underscores, spaces
    if (!/^[\p{L}\p{N}_\- ]+$/u.test(name)) return;
    onSelect(name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreate();
  };

  const handleSelect = (name: string) => {
    onSelect(name);
  };

  const handleDelete = async (playerId: string) => {
    setDeleting(playerId);
    try {
      await deletePlayer(playerId);
      toast.success(`Deleted ${playerId}`);
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      if (localStorage.getItem("farmPlayer") === playerId) localStorage.removeItem("farmPlayer");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to delete player"); }
    finally { setDeleting(null); }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 dark:from-emerald-950/55 via-emerald-50/30 dark:via-emerald-950/30 to-amber-50 dark:to-amber-950/55 p-4">
      <div className="absolute right-3 top-3"><ThemeToggle /></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Card className="border-green-200 dark:border-emerald-800 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <span className="text-3xl">🌾</span>
              <span>Little Farm</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your name to start farming!
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-center text-green-800 dark:text-emerald-200 bg-green-50 dark:bg-emerald-950/45 rounded-lg p-2">
              💾 Farms save automatically on this device. Export a backup to protect your progress when clearing browser data or changing devices.
            </p>

            {/* New player input */}
            <div className="flex gap-2">
              <Input
                placeholder="Your farmer name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={20}
                className="flex-1"
                autoFocus
              />
              <Button
                onClick={handleCreate}
                disabled={!newName.trim() || newName.trim().length > 20}
                className="bg-green-600 hover:bg-green-700 shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" />
                Play
              </Button>
            </div>

            {/* Existing players */}
            {players.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground text-center uppercase tracking-wider">
                  Or continue with:
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {players.map((p) => (
                    <div key={p.id} className="flex items-center gap-1">
                      <button
                        onClick={() => handleSelect(p.id)}
                        className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg border border-green-100 dark:border-emerald-800 hover:bg-green-50 dark:hover:bg-emerald-950/45 hover:border-green-300 dark:hover:border-emerald-800 transition-all text-left group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-emerald-950/45 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-green-700 dark:text-emerald-300" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{p.id}</div>
                            <div className="text-xs text-muted-foreground">
                              Lv.{p.level} · Last seen {new Date(p.lastOnlineAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <LogIn className="h-4 w-4 text-green-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>

                      {/* Delete button with confirmation */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-red-300 dark:text-rose-400 hover:text-red-600 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/45 shrink-0"
                            disabled={deleting !== null}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete &quot;{p.id}&quot;?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this farm and <b>all progress</b> including
                              coins, XP, crops, mastery, animals, and hybrids. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(p.id)}
                              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            >
                              {deleting === p.id ? "Deleting..." : "Yes, delete permanently"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || players.length === 0}>
                <Download className="h-4 w-4 mr-1" /> Export saves
              </Button>
              <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
                <Upload className="h-4 w-4 mr-1" /> Import saves
              </Button>
              <input ref={importRef} className="hidden" type="file" accept=".json,application/json" onChange={handleImport} aria-label="Select a Little Farm backup JSON file" />
            </div>

            {loading && (
              <div className="text-center text-sm text-muted-foreground py-2">
                Loading...
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
