import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "~/lib/query-client";
import { useAuth } from "~/providers/auth-provider";
import { listDevices } from "~/services/device-service";
import type { DeviceInfo } from "~/types";

export function useDevices() {
  const { user } = useAuth();
  return useQuery<DeviceInfo[]>({
    queryKey: QUERY_KEYS.devices,
    queryFn: listDevices,
    enabled: Boolean(user),
    refetchInterval: 60_000,
  });
}
