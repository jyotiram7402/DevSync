import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

/** Live network connectivity (drives offline UI + queue flushing). */
export function useConnection(): { online: boolean } {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(state.isConnected !== false);
    });
    return () => unsubscribe();
  }, []);

  return { online };
}
