/**
 * Cloud execution target. Cloud Sandbox is the SDK default. Online computers
 * are machines registered to the same Letta account.
 */
import { BottomSheetTextInput, type BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import type { ComputerSummary } from "../../lib/letta/api";
import { useTheme } from "../../theme/ThemeProvider";
import { radius, space } from "../../theme/tokens";
import { Sheet } from "../ui/Sheet";
import { Text } from "../ui/Text";
import { Touchable } from "../ui/Touchable";

interface Props {
  computers: ComputerSummary[];
  selectedDeviceId: string | null;
  directory?: string;
  onSelect: (computer: { deviceId: string; name: string } | null) => void;
  onSetDirectory: (directory: string) => void;
  loading?: boolean;
  error?: string | null;
}

export const EnvironmentSheet = forwardRef<BottomSheetModal, Props>(function EnvironmentSheet(
  { computers, selectedDeviceId, directory = "", onSelect, onSetDirectory, loading, error },
  ref,
) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState(directory);
  useEffect(() => setDraft(directory), [directory]);
  const online = computers.filter((computer) => computer.status === "online" && computer.connectionId);

  const choose = (computer: { deviceId: string; name: string } | null) => {
    onSelect(computer);
    // A computer stays open so the directory can be set. Sandbox has no directory.
    if (computer === null && ref && "current" in ref) ref.current?.dismiss();
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
      {selectedDeviceId ? (
        <View style={styles.directory}>
          <Text role="sub" ink={2}>
            Directory on this computer
          </Text>
          <BottomSheetTextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="/path/on/that/computer"
            placeholderTextColor={colors.ink3}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, { color: colors.ink, borderColor: colors.surfaceEdge }]}
          />
          <Touchable
            accessibilityRole="button"
            accessibilityLabel="Set directory"
            onPress={() => {
              onSetDirectory(draft.trim());
              if (ref && "current" in ref) ref.current?.dismiss();
            }}
          >
            <Text role="sub" tone="accent">
              Set directory
            </Text>
          </Touchable>
          <Text role="sub" ink={3}>
            Leave it blank to use the directory Letta Code already has open.
          </Text>
        </View>
      ) : null}
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
  directory: { gap: space.sm, paddingTop: space.sm },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.row,
    paddingHorizontal: space.md,
    paddingVertical: 9,
    fontSize: 15,
  },
});
