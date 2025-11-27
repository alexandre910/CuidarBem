import React from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ProfileCard } from "@/components/ProfileCard";
import { useData } from "@/context/DataContext";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { Colors, Spacing } from "@/constants/theme";
import { Cuidador, Enfermeiro } from "@/types";

type NavigationProp = NativeStackNavigationProp<any>;

export default function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { getFavorites } = useData();
  const { paddingTop, paddingBottom } = useScreenInsets();

  const favoriteProfiles = getFavorites();

  const handleProfilePress = (profile: Cuidador | Enfermeiro) => {
    navigation.navigate("SearchTab", {
      screen: "ProfileDetail",
      params: { profileId: profile.id },
    });
  };

  const renderItem = ({ item }: { item: Cuidador | Enfermeiro }) => (
    <ProfileCard profile={item} onPress={() => handleProfilePress(item)} />
  );

  return (
    <View style={[styles.container, { paddingTop }]}>
      <FlatList
        data={favoriteProfiles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: paddingBottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="heart" size={48} color="#CCCCCC" />
            <ThemedText type="body" style={styles.emptyText}>
              Nenhum favorito ainda
            </ThemedText>
            <ThemedText type="small" style={styles.emptySubtext}>
              Adicione profissionais aos favoritos para encontrá-los facilmente
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundRoot,
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
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
});
