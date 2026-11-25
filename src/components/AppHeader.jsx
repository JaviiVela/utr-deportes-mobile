import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/theme";

const AppHeader = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>UTR</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>
            UTR <Text style={styles.brandAccent}>| Deportes</Text>
          </Text>
          <Text style={styles.userText} numberOfLines={1}>
            {user?.nombre || "Estudiante"}
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.rolePill, isAdmin && styles.rolePillAdmin]}
          onPress={() => {
            if (!isAdmin) {
              navigation.navigate("Forbidden");
            }
          }}
        >
          <Text style={[styles.roleText, isAdmin && styles.roleTextAdmin]}>
            {user?.rol || "USER"}
          </Text>
        </Pressable>

        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Salir</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.navy,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.crimson,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: COLORS.white, fontWeight: "800", fontSize: 12 },
  brandTitle: { fontSize: 15, fontWeight: "800", color: COLORS.navy },
  brandAccent: { color: COLORS.redAccent, fontWeight: "700" },
  userText: { fontSize: 12, color: COLORS.textMuted, maxWidth: 150 },
  actionsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  rolePill: {
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  rolePillAdmin: { backgroundColor: COLORS.redSoft },
  roleText: { fontSize: 11, fontWeight: "800", color: COLORS.navy },
  roleTextAdmin: { color: COLORS.redAccent },
  logoutBtn: {
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  logoutText: { fontSize: 12, fontWeight: "700", color: COLORS.redAccent },
});

export default AppHeader;
