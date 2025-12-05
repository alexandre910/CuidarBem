import React, { useState, useMemo } from "react";
import { StyleSheet, View, Pressable, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { Input } from "@/components/Input";
import { ProfileCard } from "@/components/ProfileCard";
import { FilterModal } from "@/components/FilterModal";
import { useData } from "@/context/DataContext";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { SearchFilters, Cuidador, Enfermeiro, AvailabilityType } from "@/types";
import { SearchStackParamList } from "@/navigation/SearchStackNavigator";

const availabilityQuickFilters: { value: AvailabilityType; label: string }[] = [
  { value: "hora", label: "Por Hora" },
  { value: "dia", label: "Por Dia" },
  { value: "mes", label: "Por Mês" },
];

type NavigationProp = NativeStackNavigationProp<SearchStackParamList>;

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { professionals, searchProfessionals } = useData();
  const { paddingTop, paddingBottom } = useScreenInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilityType | null>(null);

  const filteredProfessionals = useMemo(() => {
    let results = searchProfessionals(filters);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (p) =>
          p.nome.toLowerCase().includes(query) ||
          p.cidade.toLowerCase().includes(query)
      );
    }

    if (selectedAvailability) {
      results = results.filter((p) =>
        p.disponibilidade.includes(selectedAvailability)
      );
    }

    return results.sort((a, b) => b.avaliacaoMedia - a.avaliacaoMedia);
  }, [professionals, filters, searchQuery, selectedAvailability]);

  const handleAvailabilityFilter = (value: AvailabilityType) => {
    setSelectedAvailability(selectedAvailability === value ? null : value);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const handleProfilePress = (profile: Cuidador | Enfermeiro) => {
    navigation.navigate("ProfileDetail", { profileId: profile.id });
  };

  const renderItem = ({ item }: { item: Cuidador | Enfermeiro }) => (
    <ProfileCard profile={item} onPress={() => handleProfilePress(item)} />
  );

  return (
    <View style={[styles.container, { paddingTop }]}>
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Input
            placeholder="Buscar por nome ou cidade..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="search"
            containerStyle={styles.searchInput}
          />
        </View>
        <Pressable
          onPress={() => setShowFilters(true)}
          style={styles.filterButton}
        >
          <Feather name="sliders" size={22} color={Colors.light.text} />
          {activeFiltersCount > 0 ? (
            <View style={styles.filterBadge}>
              <ThemedText type="caption" style={styles.filterBadgeText}>
                {activeFiltersCount}
              </ThemedText>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.availabilityFilters}>
        {availabilityQuickFilters.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => handleAvailabilityFilter(option.value)}
            style={[
              styles.availabilityButton,
              selectedAvailability === option.value && styles.availabilityButtonActive,
            ]}
          >
            <ThemedText
              type="small"
              style={[
                styles.availabilityText,
                selectedAvailability === option.value && styles.availabilityTextActive,
              ]}
            >
              {option.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredProfessionals}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: paddingBottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="search" size={48} color="#CCCCCC" />
            <ThemedText type="body" style={styles.emptyText}>
              Nenhum profissional encontrado
            </ThemedText>
            <ThemedText type="small" style={styles.emptySubtext}>
              Tente ajustar os filtros de busca
            </ThemedText>
          </View>
        }
      />

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={setFilters}
        initialFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundRoot,
  },
  searchHeader: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    alignItems: "flex-start",
  },
  searchInputContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  searchInput: {
    marginBottom: 0,
  },
  filterButton: {
    width: Spacing.inputHeight,
    height: Spacing.inputHeight,
    borderRadius: Spacing.inputHeight / 2,
    backgroundColor: Colors.light.backgroundDefault,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginTop: 22,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.light.accent2,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyText: {
    marginTop: Spacing.lg,
    color: "#666666",
  },
  emptySubtext: {
    marginTop: Spacing.xs,
    color: "#999999",
  },
  availabilityFilters: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  availabilityButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundDefault,
  },
  availabilityButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  availabilityText: {
    color: Colors.light.text,
    fontWeight: "500",
  },
  availabilityTextActive: {
    color: "#000000",
    fontWeight: "600",
  },
});
