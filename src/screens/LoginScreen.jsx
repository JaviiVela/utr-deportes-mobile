import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/theme";

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(formData.email.trim(), formData.password);
    } catch (err) {
      setError(err.customMessage || "Credenciales incorrectas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Encabezado Institucional */}
          <View style={styles.brandBanner}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>UTR</Text>
            </View>
            <Text style={styles.brandTitle}>
              UTR <Text style={styles.brandHighlight}>| Deportes</Text>
            </Text>
            <Text style={styles.brandSubtitle}>
              Préstamo de material deportivo
            </Text>
          </View>

          {/* Tarjeta Formulario */}
          <View style={styles.card}>
            <Text style={styles.title}>Bienvenido de vuelta</Text>
            <Text style={styles.subtitle}>
              Inicia sesión con tu cuenta institucional.
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="alumno@equipo-b2.utr"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={formData.email}
                onChangeText={(text) => handleChange("email", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu contraseña"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                (isSubmitting || pressed) && styles.primaryBtnDisabled,
              ]}
              disabled={isSubmitting}
              onPress={handleSubmit}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryBtnText}>Iniciar Sesión</Text>
              )}
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>¿No tienes cuenta? </Text>
              <Pressable onPress={() => navigation.navigate("Register")}>
                <Text style={styles.footerLink}>Regístrate aquí</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgPage },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  brandBanner: {
    backgroundColor: COLORS.navy,
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.crimson,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.crimson,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoText: { color: COLORS.white, fontWeight: "800", fontSize: 13 },
  brandTitle: { color: COLORS.white, fontSize: 22, fontWeight: "800" },
  brandHighlight: { color: "#fca5a5", fontWeight: "700" },
  brandSubtitle: { color: "#cbd5e1", fontSize: 13, marginTop: 2 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    elevation: 2,
  },
  title: { fontSize: 21, fontWeight: "800", color: COLORS.navy },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: COLORS.redSoft,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: { color: COLORS.redAccent, fontSize: 13, fontWeight: "600" },
  inputGroup: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.textMain,
    backgroundColor: COLORS.white,
  },
  primaryBtn: {
    backgroundColor: COLORS.navy,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  primaryBtnDisabled: { opacity: 0.75 },
  primaryBtnText: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  footerText: { fontSize: 13, color: COLORS.textMuted },
  footerLink: { fontSize: 13, fontWeight: "700", color: COLORS.redAccent },
});

export default LoginScreen;
