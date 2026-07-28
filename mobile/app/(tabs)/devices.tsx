import { useEffect, useState } from "react";
import { FlatList, RefreshControl } from "react-native";

import { DeviceCard } from "~/components/device-card";
import { EmptyState, Screen, Spinner } from "~/components/ui";
import { useDevices } from "~/hooks/use-devices";
import { useTheme } from "~/providers/theme-provider";
import { getThisDeviceId } from "~/services/device-service";

export default function DevicesScreen() {
  const theme = useTheme();
  const devices = useDevices();
  const [thisDeviceId, setThisDeviceId] = useState<string | null>(null);

  useEffect(() => {
    void getThisDeviceId().then(setThisDeviceId);
  }, []);

  if (devices.isLoading) {
    return (
      <Screen>
        <Spinner label="Loading devices" />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={devices.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: theme.spacing(3) }}
        refreshControl={
          <RefreshControl
            refreshing={devices.isFetching}
            onRefresh={() => void devices.refetch()}
            tintColor={theme.colors.brand}
          />
        }
        renderItem={({ item }) => (
          <DeviceCard device={item} isCurrent={item.id === thisDeviceId} />
        )}
        ListEmptyComponent={
          <EmptyState title="No devices" description="Sign in on other devices to see them here." />
        }
      />
    </Screen>
  );
}
