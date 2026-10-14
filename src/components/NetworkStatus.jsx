
import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Network } from "@capacitor/network";

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    let active = true;
    let networkListener;

    const updateStatus = (connected) => {
      if (active) {
        setIsOnline(connected);
      }
    };

    const setupNetworkListener = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          // Read the current native network status.
          const status = await Network.getStatus();
          updateStatus(status.connected);

          // Listen for Android network changes.
          networkListener = await Network.addListener(
            "networkStatusChange",
            (status) => {
              updateStatus(status.connected);
            }
          );
        } else {
          // Browser fallback.
          updateStatus(navigator.onLine);

          const handleOnline = () => updateStatus(true);
          const handleOffline = () => updateStatus(false);

          window.addEventListener("online", handleOnline);
          window.addEventListener("offline", handleOffline);

          networkListener = {
            remove: () => {
              window.removeEventListener("online", handleOnline);
              window.removeEventListener("offline", handleOffline);
            },
          };
        }
      } catch (error) {
        console.error("Unable to monitor network status:", error);
      }
    };

    setupNetworkListener();

    return () => {
      active = false;
      networkListener?.remove();
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[200] flex items-center justify-center gap-2 bg-red-600 px-4 py-3 text-center text-sm font-medium text-white shadow-md"
      style={{
        paddingTop: "max(12px, env(safe-area-inset-top))",
      }}
    >
      <WifiOff size={18} aria-hidden="true" />
      <span>
        You're offline. Please check your internet connection.
      </span>
    </div>
  );
}
