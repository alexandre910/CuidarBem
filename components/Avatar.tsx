import React from "react";
import { StyleSheet, View, Image, ViewStyle, StyleProp } from "react-native";
import { Feather } from "@expo/vector-icons";

import { Colors, BorderRadius } from "@/constants/theme";
import { UserRole } from "@/types";

interface AvatarProps {
  uri?: string;
  size?: number;
  role?: UserRole;
  style?: StyleProp<ViewStyle>;
}

const defaultAvatars: Record<UserRole, any> = {
  cuidador: require("../assets/images/avatars/cuidador.png"),
  enfermeiro: require("../assets/images/avatars/enfermeiro.png"),
  contratante: require("../assets/images/avatars/contratante.png"),
  empresa: require("../assets/images/avatars/empresa.png"),
};

export function Avatar({ uri, size = 60, role, style }: AvatarProps) {
  const getImageSource = () => {
    if (uri) {
      return { uri };
    }
    if (role && defaultAvatars[role]) {
      return defaultAvatars[role];
    }
    return null;
  };

  const imageSource = getImageSource();

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
          resizeMode="cover"
        />
      ) : (
        <Feather name="user" size={size * 0.5} color={Colors.light.text} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    backgroundColor: Colors.light.backgroundSecondary,
  },
});
