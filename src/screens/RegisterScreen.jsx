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

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    matricula: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    const { nombre, matricula, email, password, confirmPassword } = formData;

    if (
      !nombre.trim() ||
      !matricula.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        nombre: nombre.trim(),
        matricula: matricula.trim(),
        email: email.trim(),
        password,
      });
      setSuccess("Cuenta creada (Rol: USER). Redirigiendo al login...");
      setTimeout(() => navigation.navigate("Login"), 1500);
    } catch (err) {
      setError(err.customMessage || "No se pudo completar el registro.");
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
          <View style={styles.card}>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>
              Completa tus datos institucionales UTR.
            </Text>

            <View style={styles.roleBanner}>
              <Text style={styles.roleBannerText}>
                El rol asignado por defecto es{" "}
                <Text style={{ fontWeight: "800" }}>USER</Text>.
              </Text>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre Completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Javier Cisneros"
                placeholderTextColor={COLORS.textMuted}
                value={formData.nombre}
                onChangeText={(text) => handleChange("nombre", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Matrícula</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. UTR20260124"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
                value={formData.matricula}
                onChangeText={(text) => handleChange("matricula", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="estudiante@utr.edu.mx"
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
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Repite tu contraseña"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
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
                <Text style={styles.primaryBtnText}>Crear Cuenta</Text>
              )}
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
              <Pressable onPress={() => navigation.navigate("Login")}>
                <Text style={styles.footerLink}>Inicia sesión</Text>
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
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderTopWidth: 4,
    borderTopColor: COLORS.crimson,
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.navy },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 14,
  },
  roleBanner: {
    backgroundColor: COLORS.navyLight,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.crimson,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  roleBannerText: { fontSize: 12, color: COLORS.navy },
  errorBox: {
    backgroundColor: COLORS.redSoft,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorText: { color: COLORS.redAccent, fontSize: 13, fontWeight: "600" },
  successBox: {
    backgroundColor: COLORS.emeraldSoft,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  successText: { color: COLORS.emerald, fontSize: 13, fontWeight: "600" },
  inputGroup: { marginBottom: 12 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textMain,
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
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  footerText: { fontSize: 13, color: COLORS.textMuted },
  footerLink: { fontSize: 13, fontWeight: "700", color: COLORS.redAccent },
});

export default RegisterScreen;
