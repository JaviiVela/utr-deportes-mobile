import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/theme";

const ForbiddenScreen = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>403</Text>
        </View>
        <Text style={styles.title}>Acceso Restringido</Text>
        <Text style={styles.description}>
          Tu sesión actual tiene rol{" "}
          <Text style={styles.bold}>{user?.rol || "USER"}</Text>. Esta sección
          es exclusiva para administradores de Coordinación Deportiva.
        </Text>

        <Pressable style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Volver al Inventario</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 26,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderTopWidth: 4,
    borderTopColor: COLORS.crimson,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.redSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  badgeText: { fontSize: 22, fontWeight: "800", color: COLORS.redAccent },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.navy,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  bold: { fontWeight: "800", color: COLORS.navy },
  btn: {
    backgroundColor: COLORS.navy,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  btnText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
});

export default ForbiddenScreen;
