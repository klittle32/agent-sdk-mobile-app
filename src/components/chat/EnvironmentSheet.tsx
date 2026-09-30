/**
 * Cloud execution target. Cloud Sandbox is the SDK default. Online computers
 * are machines registered to the same Letta account.
 */
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef } from "react";
import { StyleSheet, View } from "react-native";

import type { ComputerSummary } from "../../lib/letta/api";
import { useTheme } from "../../theme/ThemeProvider";
import { space } from "../../theme/tokens";
import { Sheet } from "../ui/Sheet";
import { Text } from "../ui/Text";
import { Touchable } from "../ui/Touchable";

interface Props {
  computers: ComputerSummary[];
  selectedDeviceId: string | null;
  onSelect: (computer: { deviceId: string; name: string } | null) => void;
  loading?: boolean;
  error?: string | null;
}

export const EnvironmentSheet = forwardRef<BottomSheetModal, Props>(function EnvironmentSheet(
  { computers, selectedDeviceId, onSelect, loading, error },
  ref,
) {
  const { colors } = useTheme();
  const online = computers.filter((computer) => computer.status === "online" && computer.connectionId);

  const choose = (computer: { deviceId: string; name: string } | null) => {
    onSelect(computer);
    if (ref && "current" in ref) ref.current?.dismiss();
  };

  return (
    <Sheet ref={ref} title="Environment">
      {loading ? (
        <Text role="sub" ink={3}>
          Loading environments…
        </Text>
      ) : null}
      {error ? (
        <Text role="sub" tone="danger">
          {error}
        </Text>
      ) : null}
      <Touchable
        accessibilityRole="button"
        accessibilityLabel={`Cloud Sandbox${selectedDeviceId === null ? ", selected" : ""}`}
        onPress={() => choose(null)}
        style={styles.row}
      >
        <View style={styles.rowText}>
          <Text role="body">Cloud Sandbox</Text>
          <Text role="sub" ink={3}>
            Temporary machine, gone when the chat ends
          </Text>
        </View>
        {selectedDeviceId === null ? (
          <Text role="bodyEm" tone="accent">
            ✓
          </Text>
        ) : null}
      </Touchable>
      {online.map((computer) => {
        const selected = selectedDeviceId === computer.deviceId;
        return (
          <Touchable
            key={computer.deviceId}
            accessibilityRole="button"
            accessibilityLabel={`${computer.name}${selected ? ", selected" : ""}`}
            onPress={() => choose({ deviceId: computer.deviceId, name: computer.name })}
            style={styles.row}
          >
            <View style={styles.rowText}>
              <Text role="body">{computer.name}</Text>
              <Text role="sub" ink={3}>
                Online
              </Text>
            </View>
            <View style={[styles.dot, { backgroundColor: colors.run }]} />
            {selected ? (
              <Text role="bodyEm" tone="accent">
                ✓
              </Text>
            ) : null}
          </Touchable>
        );
      })}
      {!loading && online.length === 0 && !error ? (
        <Text role="sub" ink={3}>
          No computers online. Open Letta Code on a machine signed into this account.
        </Text>
      ) : null}
    </Sheet>
  );
});

const styles = StyleSheet.create({
  row: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: space.sm, paddingVertical: 6 },
  rowText: { flex: 1, gap: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
