import { useEffect, useRef } from "react";
import { useNetworkStatus } from "./useNetworkStatus";
import { syncPending } from "../sync/SyncEngine";
import { hydrateLocalVault } from "../db/Hydration"; // Import hydration
import { useAuth } from "../lib/AuthContext";
import toast from "react-hot-toast";

export function useSync() {
  const isOnline = useNetworkStatus();
  const { user } = useAuth();
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (isOnline && user?.id) {
      const runInitialSync = async () => {
        // A. PULL: Get cloud data down first (if not done this session)
        if (!hasHydrated.current) {
          await hydrateLocalVault(user.id);
          hasHydrated.current = true;
        }

        // B. PUSH: Send any pending local changes up
        try {
          await syncPending(user.id);
        } catch (error) {
          console.error("Auto-sync failed:", error);
        }
      };

      runInitialSync();
    }
  }, [isOnline, user?.id]);

  useEffect(() => {
    const handleOnline = () => {
      if (user?.id) {
        toast.success("Connection restored. Syncing vault...", { icon: "🔄" });
        syncPending(user.id);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [user?.id]);
}