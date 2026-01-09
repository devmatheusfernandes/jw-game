"use client";
import { JourneyPath } from "@/components/journey/JourneyPath";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getUserJourneyProgress } from "@/lib/journey";
import { UserProgress } from "@/types/journey";
import { ArrowLeft, Loader2, Star, Trophy } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SettingsDropdown } from "@/components/ui/SettingsDropdown";

export default function JourneyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      getUserJourneyProgress(user.uid).then(setUserProgress);
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500 dark:text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-full mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <UserAvatar
              playerName={user.displayName || "User"}
              className="w-8 h-8"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-500 uppercase">
                Pontos
              </span>
              <span className="text-sm font-bold flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <Star className="w-3 h-3 fill-current" />
                {userProgress?.totalScore || 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/journey/badges"
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative"
            >
              <Trophy className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              {userProgress?.earnedBadges &&
                userProgress.earnedBadges.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
            </Link>
            <ThemeToggle />
            <SettingsDropdown showSeeAll={true} />
            <h1 className="hidden text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Minha Jornada
            </h1>
          </div>
        </div>
      </header>

      <main>
        <JourneyPath />
      </main>
    </div>
  );
}
