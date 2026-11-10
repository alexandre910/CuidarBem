import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { Input } from "@/components/Input";
import { ProfileCard } from "@/components/ProfileCard";
import { FilterModal } from "@/components/FilterModal";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { Colors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { SearchFilters, Cuidador, Enfermeiro } from "@/types";
import { SearchStackParamList } from "@/navigation/SearchStackNavigator";

type NavigationProp = NativeStackNavigationProp<SearchStackParamList>;

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { professionals, searchProfessionals } = useData();
  const { user, subscription } = useAuth();
  const { paddingTop, paddingBottom } = useScreenInsets();
  const { isDesktop, contentMaxWidth, horizontalPadding } =
    useResponsiveLayout();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const isProfessional = user?.role === "cuidador" || user?.role === "enfermeiro";

  const filteredProfessionals = useMemo(() => {
    if (isProfessional && user) {
      const ownProfile = professionals.find(p => p.id === user.id);
      return ownProfile ? [ownProfile] : [];
    }

    let results = searchProfessionals(filters);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (p) =>
          p.nome.toLowerCase().includes(query) ||
          p.cidade.toLowerCase().includes(query)
      );
    }

    return results.sort((a, b) => b.avaliacaoMedia - a.avaliacaoMedia);
  }, [professionals, filters, searchQuery, isProfessional, user]);

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const handleProfilePress = (profile: Cuidador | Enfermeiro) => {
    navigation.navigate("ProfileDetail", { profileId: profile.id });
  };

  const renderItem = ({ item }: { item: Cuidador | Enfermeiro }) => (
    <View style={isDesktop ? styles.desktopGridItem : undefined}>
      <ProfileCard
        profile={item}
        onPress={() => handleProfilePress(item)}
        isOwnProfile={isProfessional && user?.id === item.id}
        subscription={
          isProfessional && user?.id === item.id ? subscription : undefined
        }
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop }]}>
      {isProfessional ? (
        <View
          style={[
            styles.professionalHeader,
            isDesktop && styles.desktopSection,
            { maxWidth: isDesktop ? contentMaxWidth : undefined },
          ]}
        >
          <ThemedText type="subtitle" style={styles.professionalTitle}>
            Meu Perfil Profissional
          </ThemedText>
        </View>
      ) : (
        <View
          style={[
            styles.searchHeader,
            isDesktop && styles.desktopSection,
            { maxWidth: isDesktop ? contentMaxWidth : undefined },
          ]}
        >
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
      )}

      <FlatList
        key={isDesktop ? "desktop-columns" : "mobile-column"}
        data={filteredProfessionals}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={isDesktop ? 2 : 1}
        columnWrapperStyle={isDesktop ? styles.desktopGridRow : undefined}
        contentContainerStyle={[
          styles.list,
          isDesktop && styles.desktopList,
          {
            paddingBottom: paddingBottom + Spacing.xl,
            paddingHorizontal: horizontalPadding,
            maxWidth: isDesktop ? contentMaxWidth : undefined,
          },
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
  professionalHeader: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  desktopSection: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  professionalTitle: {
    textAlign: "center",
    color: Colors.light.text,
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
  desktopList: {
    width: "100%",
    alignSelf: "center",
  },
  desktopGridRow: {
    justifyContent: "space-between",
    gap: Spacing.lg,
  },
  desktopGridItem: {
    width: "48.5%",
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
});
