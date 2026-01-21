import { useEffect, useState } from "react";
import { supabase } from "../lib/Supabase";
import { syncPending } from "../sync/SyncEngine";

export function useNetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Function to handle online event
    const onOnline = async () => {
      setOnline(true);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id) {
        try {
          await syncPending(user.id); // pass the user ID to sync engine
        } catch (err) {
          console.error("Failed to sync pending data:", err);
        }
      }
    };

    // Function to handle offline event
    const onOffline = () => setOnline(false);

    // Add event listeners
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return online;
}
