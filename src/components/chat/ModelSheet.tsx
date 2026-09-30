/**
 * Model & reasoning sheet (docs/design-doc.md §4.5): search, model rows
 * with mono handles, and an effort segment. Saving state stays on the chip
 * until the server confirms; failures revert with an inline error.
 */
import { BottomSheetTextInput, type BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import type { ModelOption, ReasoningEffort } from "../../lib/letta/api";
import { loadFavoriteModels, loadRecentModels, pushRecentModel, toggleFavoriteModel } from "../../lib/modelPrefs";
import { useTheme } from "../../theme/ThemeProvider";
import { radius, space } from "../../theme/tokens";
import { Sheet } from "../ui/Sheet";
import { Text } from "../ui/Text";
import { Touchable } from "../ui/Touchable";

const EFFORTS: ReasoningEffort[] = ["none", "minimal", "low", "medium", "high", "xhigh"];

function ModelPick({
  model,
  selected,
  favorite,
  onPress,
  onFavorite,
}: {
  model: ModelOption;
  selected: boolean;
  favorite: boolean;
  onPress: () => void;
  onFavorite: () => void;
}) {
  return (
    <View style={styles.modelRow}>
      <Touchable accessibilityRole="button" accessibilityLabel={`Model ${model.label}${selected ? ", selected" : ""}`} onPress={onPress} style={styles.modelMain}>
        <View style={styles.modelText}>
          <Text role="body">{model.label}</Text>
          <Text role="sub" ink={3} mono>
            {model.handle}
          </Text>
        </View>
        {selected ? (
          <Text role="bodyEm" tone="accent">
            ✓
          </Text>
        ) : null}
      </Touchable>
      <Touchable accessibilityRole="button" accessibilityLabel={favorite ? `Unfavorite ${model.label}` : `Favorite ${model.label}`} onPress={onFavorite}>
        <Text role="body" tone={favorite ? "accent" : undefined} ink={favorite ? undefined : 3}>
          {favorite ? "★" : "☆"}
        </Text>
      </Touchable>
    </View>
  );
}

interface Props {
  models: ModelOption[];
  currentModel: string | null;
  currentEffort: string | null;
  onSelect: (model: string, effort?: ReasoningEffort) => void;
  error?: string | null;
}

export const ModelSheet = forwardRef<BottomSheetModal, Props>(function ModelSheet(
  { models, currentModel, currentEffort, onSelect, error },
  ref,
) {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [effort, setEffort] = useState<ReasoningEffort | null>(
    EFFORTS.includes(currentEffort as ReasoningEffort) ? (currentEffort as ReasoningEffort) : null,
  );

  useEffect(() => {
    void loadFavoriteModels().then(setFavorites);
    void loadRecentModels().then(setRecents);
  }, []);

  const byHandle = new Map(models.map((model) => [model.handle, model]));
  const favoriteModels = favorites.map((handle) => byHandle.get(handle)).filter((model): model is ModelOption => !!model);
  const recentModels = recents
    .filter((handle) => !favorites.includes(handle))
    .map((handle) => byHandle.get(handle))
    .filter((model): model is ModelOption => !!model);

  const filtered = models.filter(
    (m) =>
      m.label.toLowerCase().includes(search.toLowerCase()) ||
      m.handle.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Sheet ref={ref} title="Model">
      <BottomSheetTextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search models…"
        placeholderTextColor={colors.ink3}
        autoCapitalize="none"
        style={[styles.search, { borderColor: colors.surfaceEdge, color: colors.ink }]}
      />
      <View style={styles.effortBlock}>
        <Text role="micro" ink={3}>
          Reasoning effort
        </Text>
        <View style={[styles.segment, { borderColor: colors.surfaceEdge }]}>
          {EFFORTS.map((e) => (
            <Touchable
              key={e}
              accessibilityRole="button"
              accessibilityLabel={`Effort ${e}${effort === e ? ", selected" : ""}`}
              onPress={() => setEffort(effort === e ? null : e)}
              style={[styles.segmentItem, effort === e && { backgroundColor: colors.bubble }]}
            >
              <Text role="sub" ink={effort === e ? 1 : 2} style={styles.segmentLabel}>
                {e}
              </Text>
            </Touchable>
          ))}
        </View>
      </View>
      {error ? (
        <Text role="sub" tone="danger">
          {error}
        </Text>
      ) : null}
      <View style={styles.listBlock}>
        {search.length === 0 && favoriteModels.length > 0 ? (
          <Text role="micro" ink={3}>Favorites</Text>
        ) : null}
        {search.length === 0
          ? favoriteModels.map((m) => (
              <ModelPick key={`fav-${m.handle}`} model={m} selected={currentModel === m.handle} favorite onPress={() => {
                void pushRecentModel(m.handle).then(setRecents);
                onSelect(m.handle, effort ?? undefined);
              }} onFavorite={() => void toggleFavoriteModel(m.handle).then(setFavorites)} />
            ))
          : null}
        {search.length === 0 && recentModels.length > 0 ? (
          <Text role="micro" ink={3}>Recent</Text>
        ) : null}
        {search.length === 0
          ? recentModels.map((m) => (
              <ModelPick key={`recent-${m.handle}`} model={m} selected={currentModel === m.handle} favorite={favorites.includes(m.handle)} onPress={() => {
                void pushRecentModel(m.handle).then(setRecents);
                onSelect(m.handle, effort ?? undefined);
              }} onFavorite={() => void toggleFavoriteModel(m.handle).then(setFavorites)} />
            ))
          : null}
        {filtered.slice(0, 8).map((m) => {
          const selected = currentModel === m.handle;
          return (
            <Touchable
              key={m.handle}
              accessibilityRole="button"
              accessibilityLabel={`Model ${m.label}${selected ? ", selected" : ""}`}
              onPress={() => {
                void pushRecentModel(m.handle).then(setRecents);
                onSelect(m.handle, effort ?? undefined);
              }}
              style={styles.modelRow}
            >
              <View style={styles.modelRowInner}>
                <View style={styles.modelText}>
                  <Text role="body">{m.label}</Text>
                  <Text role="sub" ink={3} mono>
                    {m.handle}
                  </Text>
                </View>
                {selected ? (
                  <Text role="bodyEm" tone="accent">
                    ✓
                  </Text>
                ) : null}
                <Touchable
                  accessibilityRole="button"
                  accessibilityLabel={favorites.includes(m.handle) ? `Unfavorite ${m.label}` : `Favorite ${m.label}`}
                  onPress={() => void toggleFavoriteModel(m.handle).then(setFavorites)}
                >
                  <Text role="body" tone={favorites.includes(m.handle) ? "accent" : undefined} ink={favorites.includes(m.handle) ? undefined : 3}>
                    {favorites.includes(m.handle) ? "★" : "☆"}
                  </Text>
                </Touchable>
              </View>
            </Touchable>
          );
        })}
        {filtered.length === 0 ? (
          <Text role="sub" ink={3}>
            No models match “{search}”.
          </Text>
        ) : null}
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  search: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.row,
    paddingHorizontal: space.md,
    paddingVertical: 9,
    fontSize: 15,
  },
  effortBlock: { gap: space.sm },
  segment: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.row,
    overflow: "hidden",
  },
  segmentItem: { flexGrow: 1, flexBasis: "16%", minHeight: 38, alignItems: "center" },
  segmentLabel: { textTransform: "capitalize", fontSize: 12 },
  listBlock: { gap: 2 },
  modelRow: { minHeight: 46, flexDirection: "row", alignItems: "center" },
  modelMain: { flex: 1 },
  modelRowInner: { flexDirection: "row", alignItems: "center", gap: space.sm, paddingVertical: 6 },
  modelText: { flex: 1, gap: 1 },
});
