import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";
import AppHeader from "../components/AppHeader";
import SportItemIcon from "../components/SportItemIcon";
import { COLORS } from "../utils/theme";

const InventoryScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filtros B1
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeporte, setSelectedDeporte] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Modal B2
  const [selectedItem, setSelectedItem] = useState(null);
  const [loanForm, setLoanForm] = useState({
    cantidad: "1",
    canchaOActividad: "",
  });
  const [modalError, setModalError] = useState("");
  const [submittingLoan, setSubmittingLoan] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (selectedDeporte) params.deporte = selectedDeporte;
      if (onlyAvailable) params.disponible = true;

      const { data } = await api.get("/api/sports/items", { params });
      const list = Array.isArray(data) ? data : data.items || [];
      setItems(list);
    } catch (err) {
      setError(
        err.customMessage || "No se pudo cargar el inventario deportivo.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedDeporte, onlyAvailable]);

  const filteredItems = items.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.nombre?.toLowerCase().includes(q) ||
      item.codigo?.toLowerCase().includes(q) ||
      item.deporte?.toLowerCase().includes(q)
    );
  });

  const totalUnitsAvailable = items.reduce(
    (acc, item) => acc + (Number(item.disponibles) || 0),
    0,
  );

  const disciplines = Array.from(
    new Set([
      "Fútbol",
      "Básquetbol",
      "Voleibol",
      "Atletismo",
      ...items.map((i) => i.deporte).filter(Boolean),
    ]),
  );

  // Manejadores estandarizados (handleSelect, handleChange, handleSubmit)
  const handleSelect = (item) => {
    setSelectedItem(item);
    setLoanForm({ cantidad: "1", canchaOActividad: "" });
    setModalError("");
  };

  const handleChange = (name, value) => {
    setLoanForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuantityStep = (delta) => {
    if (!selectedItem) return;
    const current = Number(loanForm.cantidad) || 1;
    const next = current + delta;
    if (next >= 1 && next <= selectedItem.disponibles) {
      setLoanForm((prev) => ({ ...prev, cantidad: String(next) }));
    }
  };

  const handleSubmit = async () => {
    setModalError("");

    const qty = Number(loanForm.cantidad);
    if (!qty || qty < 1 || qty > selectedItem.disponibles) {
      setModalError(
        `La cantidad debe estar entre 1 y ${selectedItem.disponibles} unidades.`,
      );
      return;
    }

    if (!loanForm.canchaOActividad.trim()) {
      setModalError(
        "Indica la cancha o actividad donde utilizarás el material.",
      );
      return;
    }

    try {
      setSubmittingLoan(true);
      await api.post("/api/sports/loans", {
        itemId: selectedItem.id,
        cantidad: qty,
        canchaOActividad: loanForm.canchaOActividad.trim(),
      });

      const borrowedName = selectedItem.nombre;
      setSelectedItem(null);
      setSuccessMsg(`Préstamo registrado: ${qty}x ${borrowedName}.`);
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchItems();
    } catch (err) {
      setModalError(
        err.customMessage || "Error al registrar la solicitud de préstamo.",
      );
    } finally {
      setSubmittingLoan(false);
    }
  };

  const getStatusBadgeStyle = (estado = "BUENO") => {
    const key = estado.toUpperCase();
    if (key === "NUEVO") return { bg: COLORS.navyLight, text: COLORS.navy };
    if (key === "DESGASTADO")
      return { bg: COLORS.redSoft, text: COLORS.redAccent };
    return { bg: "#dcfce7", text: "#15803d" };
  };

  const renderItemCard = ({ item, index }) => {
    const available = Number(item.disponibles) || 0;
    const badge = getStatusBadgeStyle(item.estadoFisico);
    const isAltBanner = index % 3 === 2;

    return (
      <View style={styles.card}>
        <View style={[styles.cardBanner, isAltBanner && styles.cardBannerAlt]}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{item.codigo}</Text>
          </View>
          <SportItemIcon nombre={item.nombre} deporte={item.deporte} />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.nombre}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.statusText, { color: badge.text }]}>
                {item.estadoFisico || "BUENO"}
              </Text>
            </View>
          </View>

          <Text style={styles.itemSport}>{item.deporte}</Text>

          <View style={styles.cardFooter}>
            <Text
              style={[styles.stockText, available === 0 && styles.stockEmpty]}
            >
              {available} disponibles
            </Text>

            <Pressable
              style={[
                styles.requestBtn,
                available <= 0 && styles.requestBtnDisabled,
              ]}
              disabled={available <= 0}
              onPress={() => handleSelect(item)}
            >
              <Text
                style={[
                  styles.requestBtnText,
                  available <= 0 && styles.requestBtnTextDisabled,
                ]}
              >
                Solicitar Préstamo
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItemCard}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* Título y Resumen de Unidades */}
            <View style={styles.heroRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.kicker}>CATÁLOGO UTR</Text>
                <Text style={styles.pageTitle}>Inventario Deportivo</Text>
                <Text style={styles.pageSub}>
                  Material disponible en el campus.
                </Text>
              </View>

              <View style={styles.unitsBox}>
                <Text style={styles.unitsLabel}>Disponibles</Text>
                <Text style={styles.unitsValue}>{totalUnitsAvailable}</Text>
              </View>
            </View>

            {successMsg ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Barra de Búsqueda y Filtros */}
            <View style={styles.filterPanel}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar material o código..."
                placeholderTextColor={COLORS.textMuted}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                <Pressable
                  style={[
                    styles.chip,
                    selectedDeporte === "" && styles.chipActive,
                  ]}
                  onPress={() => setSelectedDeporte("")}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedDeporte === "" && styles.chipTextActive,
                    ]}
                  >
                    Todas
                  </Text>
                </Pressable>

                {disciplines.map((dep) => {
                  const active = selectedDeporte === dep;
                  return (
                    <Pressable
                      key={dep}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setSelectedDeporte(dep)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {dep}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.filterBottomRow}>
                <Pressable
                  style={[
                    styles.availToggle,
                    onlyAvailable && styles.availToggleActive,
                  ]}
                  onPress={() => setOnlyAvailable((prev) => !prev)}
                >
                  <Text
                    style={[
                      styles.availToggleText,
                      onlyAvailable && styles.availToggleTextActive,
                    ]}
                  >
                    {onlyAvailable
                      ? "✓ Solo disponibles"
                      : "Mostrar solo disponibles"}
                  </Text>
                </Pressable>

                <Text style={styles.countText}>
                  {filteredItems.length} artículos
                </Text>
              </View>
            </View>

            {loading ? (
              <ActivityIndicator
                size="large"
                color={COLORS.navy}
                style={{ marginVertical: 24 }}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>
              No se encontraron artículos con los filtros actuales.
            </Text>
          ) : null
        }
      />

      {/* Pantalla B2 — Modal Solicitar Préstamo */}
      <Modal
        visible={Boolean(selectedItem)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalKicker}>
                  {selectedItem?.codigo} · {selectedItem?.deporte}
                </Text>
                <Text style={styles.modalTitle}>Solicitar préstamo</Text>
              </View>
              <Pressable onPress={() => setSelectedItem(null)}>
                <Text style={styles.closeBtn}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.summaryBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryName}>{selectedItem?.nombre}</Text>
                <Text style={styles.summaryMeta}>
                  Estado físico: {selectedItem?.estadoFisico}
                </Text>
              </View>
              <Text style={styles.summaryStock}>
                Disp: {selectedItem?.disponibles}
              </Text>
            </View>

            {modalError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{modalError}</Text>
              </View>
            ) : null}

            <Text style={styles.inputLabel}>Cantidad</Text>
            <View style={styles.stepperRow}>
              <Pressable
                style={styles.stepperBtn}
                disabled={Number(loanForm.cantidad) <= 1}
                onPress={() => handleQuantityStep(-1)}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </Pressable>

              <TextInput
                style={styles.stepperInput}
                keyboardType="number-pad"
                value={loanForm.cantidad}
                onChangeText={(text) => handleChange("cantidad", text)}
              />

              <Pressable
                style={styles.stepperBtn}
                disabled={
                  Number(loanForm.cantidad) >= (selectedItem?.disponibles || 1)
                }
                onPress={() => handleQuantityStep(1)}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </Pressable>
            </View>
            <Text style={styles.helperText}>
              Máximo {selectedItem?.disponibles} unidades
            </Text>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>
              Cancha o Actividad
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej. Cancha 2 - Torneo Interno"
              placeholderTextColor={COLORS.textMuted}
              value={loanForm.canchaOActividad}
              onChangeText={(text) => handleChange("canchaOActividad", text)}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setSelectedItem(null)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.confirmBtn, submittingLoan && { opacity: 0.7 }]}
                disabled={submittingLoan}
                onPress={handleSubmit}
              >
                {submittingLoan ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.confirmBtnText}>Confirmar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgPage },
  listContent: { padding: 16, paddingBottom: 32 },
  headerBlock: { marginBottom: 8 },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.redAccent,
    letterSpacing: 0.6,
  },
  pageTitle: { fontSize: 22, fontWeight: "800", color: COLORS.navy },
  pageSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  unitsBox: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.crimson,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "flex-end",
  },
  unitsLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: "600" },
  unitsValue: { fontSize: 18, fontWeight: "800", color: COLORS.navy },
  filterPanel: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.textMain,
    marginBottom: 10,
  },
  chipsRow: { gap: 8, paddingBottom: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.bgPage,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  chipActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  chipText: { fontSize: 12, fontWeight: "700", color: COLORS.textMuted },
  chipTextActive: { color: COLORS.white },
  filterBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  availToggle: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.bgPage,
  },
  availToggleActive: { backgroundColor: COLORS.redSoft },
  availToggleText: { fontSize: 12, fontWeight: "600", color: COLORS.textMuted },
  availToggleTextActive: { color: COLORS.redAccent, fontWeight: "700" },
  countText: { fontSize: 12, fontWeight: "700", color: COLORS.navy },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 2,
  },
  cardBanner: {
    height: 105,
    backgroundColor: COLORS.navyLight,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cardBannerAlt: { backgroundColor: "#f8e8e9" },
  codeBadge: {
    position: "absolute",
    top: 10,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeText: { fontSize: 11, fontWeight: "800", color: COLORS.navy },
  cardBody: { padding: 14 },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  itemTitle: { fontSize: 16, fontWeight: "800", color: COLORS.navy, flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "800" },
  itemSport: { fontSize: 13, color: COLORS.textMuted, marginTop: 3 },
  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stockText: { fontSize: 13, fontWeight: "700", color: COLORS.navy },
  stockEmpty: { color: "#94a3b8" },
  requestBtn: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9,
  },
  requestBtnDisabled: { backgroundColor: COLORS.borderLight },
  requestBtnText: { color: COLORS.white, fontSize: 12, fontWeight: "700" },
  requestBtnTextDisabled: { color: "#94a3b8" },
  successBox: {
    backgroundColor: COLORS.emeraldSoft,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  successText: { color: COLORS.emerald, fontSize: 13, fontWeight: "700" },
  errorBox: {
    backgroundColor: COLORS.redSoft,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  errorText: { color: COLORS.redAccent, fontSize: 13, fontWeight: "600" },
  emptyText: {
    textAlign: "center",
    color: COLORS.textMuted,
    marginTop: 28,
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(9, 25, 47, 0.65)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderTopWidth: 4,
    borderTopColor: COLORS.crimson,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  modalKicker: { fontSize: 11, fontWeight: "800", color: COLORS.redAccent },
  modalTitle: { fontSize: 19, fontWeight: "800", color: COLORS.navy },
  closeBtn: { fontSize: 18, color: COLORS.textMuted, padding: 4 },
  summaryBox: {
    backgroundColor: COLORS.navyLight,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  summaryName: { fontSize: 15, fontWeight: "800", color: COLORS.navy },
  summaryMeta: { fontSize: 12, color: "#475569", marginTop: 2 },
  summaryStock: { fontSize: 13, fontWeight: "800", color: COLORS.navy },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 6,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 4,
  },
  stepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.navyLight,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: { fontSize: 18, fontWeight: "800", color: COLORS.navy },
  stepperInput: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navy,
    textAlign: "center",
    minWidth: 60,
  },
  helperText: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textMain,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtnText: { color: "#334155", fontWeight: "700", fontSize: 14 },
  confirmBtn: {
    flex: 1,
    backgroundColor: COLORS.navy,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
});

export default InventoryScreen;
