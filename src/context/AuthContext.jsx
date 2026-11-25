import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import api, { setUnauthorizedHandler } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });

    const loadStoredSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("token");
        const storedUser = await SecureStore.getItemAsync("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        await logout();
      } finally {
        setLoading(false);
      }
    };

    loadStoredSession();
  }, [logout]);

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    await SecureStore.setItemAsync("token", data.token);
    await SecureStore.setItemAsync("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const { data } = await api.post("/api/auth/register", {
      ...userData,
      rol: "USER",
    });
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token),
        isAdmin: user?.rol === "ADMIN",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
