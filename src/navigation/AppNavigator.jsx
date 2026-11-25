import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForbiddenScreen from "../screens/ForbiddenScreen";
import { COLORS } from "../utils/theme";

const Stack = createNativeStackNavigator();

const TempDashboardScreen = ({ navigation }) => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.kicker}>SESIÓN ACTIVA · EQUIPO-B2</Text>
        <Text style={styles.title}>{user?.nombre}</Text>
        <Text style={styles.role}>Rol activo: {user?.rol}</Text>

        <Pressable
          style={styles.testAdminBtn}
          onPress={() => {
            if (!isAdmin) {
              navigation.navigate("Forbidden");
            }
          }}
        >
          <Text style={styles.testAdminText}>
            {isAdmin
              ? "Acceso Admin Habilitado"
              : "Probar Acceso Restringido (403)"}
          </Text>
        </Pressable>

        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </Pressable>
      </View>
    </View>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.navy} />
        <Text style={styles.loaderText}>Verificando sesión...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="TempDashboard"
              component={TempDashboardScreen}
            />
            <Stack.Screen name="Forbidden" component={ForbiddenScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bgPage,
  },
  loaderText: { marginTop: 10, color: COLORS.navy, fontWeight: "600" },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: COLORS.bgPage,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderTopWidth: 4,
    borderTopColor: COLORS.navy,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.redAccent,
    marginBottom: 4,
  },
  title: { fontSize: 20, fontWeight: "800", color: COLORS.navy },
  role: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 18,
  },
  testAdminBtn: {
    backgroundColor: COLORS.navyLight,
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  testAdminText: { color: COLORS.navy, fontWeight: "700", fontSize: 14 },
  logoutBtn: {
    backgroundColor: COLORS.crimson,
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
});

export default AppNavigator;
