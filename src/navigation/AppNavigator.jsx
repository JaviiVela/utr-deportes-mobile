import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForbiddenScreen from "../screens/ForbiddenScreen";
import InventoryScreen from "../screens/InventoryScreen";
import MyLoansScreen from "../screens/MyLoansScreen";
import { COLORS } from "../utils/theme";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.navy,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
          borderTopColor: COLORS.borderLight,
          backgroundColor: COLORS.white,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
      }}
    >
      <Tab.Screen
        name="Inventario"
        component={InventoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              stroke={color}
              strokeWidth={2}
            >
              <Circle cx="12" cy="12" r="9" />
              <Path d="M12 7v10M7 12h10" />
            </Svg>
          ),
        }}
      />

      <Tab.Screen
        name="Mis Préstamos"
        component={MyLoansScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              stroke={color}
              strokeWidth={2}
            >
              <Rect x="4" y="4" width="16" height="16" rx="3" />
              <Path d="M8 10h8M8 14h5" />
            </Svg>
          ),
        }}
      />
    </Tab.Navigator>
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
            <Stack.Screen name="MainTabs" component={MainTabs} />
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
});

export default AppNavigator;
