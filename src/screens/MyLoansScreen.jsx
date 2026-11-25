import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import api from "../services/api";
import AppHeader from "../components/AppHeader";
import { COLORS } from "../utils/theme";

const MyLoansScreen = () => {
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState("ACTIVO");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const navigation = useNavigation();

  const fetchMyLoans = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");
      const { data } = await api.get("/api/sports/loans");
      const list = Array.isArray(data) ? data : data.loans || [];
      setLoans(list);
    } catch (err) {
      setError(err.customMessage || "No se pudieron cargar tus préstamos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyLoans();
    }, []),
  );

  const formatDateTime = (isoString) => {
    if (!isoString) return "Reciente";
    const date = new Date(isoString);
    return date.toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activeLoans = loans.filter((l) => l.estatus === "ACTIVO");
  const finishedLoans = loans.filter((l) => l.estatus !== "ACTIVO");
  const displayedLoans = activeTab === "ACTIVO" ? activeLoans : finishedLoans;

  const renderLoanCard = ({ item: loan }) => {
    const id = loan.loanId ?? loan.id;
    const itemName =
      typeof loan.item === "object" ? loan.item?.nombre : loan.item;
    const isActivo = loan.estatus === "ACTIVO";

    return (
      <View style={[styles.loanCard, isActivo && styles.loanCardActive]}>
        <View style={styles.loanTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.folioText}>FOLIO #{id}</Text>
            <Text style={styles.itemTitle}>
              {itemName || "Material deportivo"}
            </Text>
          </View>

          <View
            style={[styles.statusPill, !isActivo && styles.statusPillFinished]}
          >
            <Text
              style={[
                styles.statusText,
                !isActivo && styles.statusTextFinished,
              ]}
            >
              {loan.estatus || "ACTIVO"}
            </Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Cantidad</Text>
            <Text style={styles.metaValue}>{loan.cantidad}</Text>
          </View>

          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Cancha / Actividad</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              {loan.canchaOActividad || "Campus UTR"}
            </Text>
          </View>

          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Hora salida</Text>
            <Text style={styles.metaValue}>
              {formatDateTime(loan.horaSalida)}
            </Text>
          </View>
        </View>

        {isActivo ? (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingBannerText}>
              Entrega pendiente en Coordinación Deportiva
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader />

      <FlatList
        data={displayedLoans}
        keyExtractor={(item, idx) => String(item.loanId ?? item.id ?? idx)}
        renderItem={renderLoanCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMyLoans(true)}
            colors={[COLORS.navy]}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.kicker}>TU ACTIVIDAD</Text>
                <Text style={styles.pageTitle}>Mis Préstamos</Text>
                <Text style={styles.pageSub}>
                  Estado y detalles de tu material.
                </Text>
              </View>

              <Pressable
                style={styles.newLoanBtn}
                onPress={() => navigation.navigate("Inventario")}
              >
                <Text style={styles.newLoanBtnText}>+ Nuevo</Text>
              </Pressable>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Tabs Activos / Historial */}
            <View style={styles.tabsRow}>
              <Pressable
                style={[
                  styles.tabBtn,
                  activeTab === "ACTIVO" && styles.tabBtnActive,
                ]}
                onPress={() => setActiveTab("ACTIVO")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "ACTIVO" && styles.tabTextActive,
                  ]}
                >
                  Activos ({activeLoans.length})
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.tabBtn,
                  activeTab === "HISTORIAL" && styles.tabBtnActive,
                ]}
                onPress={() => setActiveTab("HISTORIAL")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "HISTORIAL" && styles.tabTextActive,
                  ]}
                >
                  Historial ({finishedLoans.length})
                </Text>
              </Pressable>
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
              {activeTab === "ACTIVO"
                ? "No tienes préstamos activos en este momento."
                : "Aún no tienes préstamos finalizados en tu historial."}
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgPage },
  listContent: { padding: 16, paddingBottom: 32 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  kicker: { fontSize: 11, fontWeight: "800", color: COLORS.redAccent },
  pageTitle: { fontSize: 22, fontWeight: "800", color: COLORS.navy },
  pageSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  newLoanBtn: {
    backgroundColor: COLORS.crimson,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  newLoanBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 13 },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    marginBottom: 14,
    gap: 16,
  },
  tabBtn: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: { borderBottomColor: COLORS.crimson },
  tabText: { fontSize: 14, fontWeight: "700", color: COLORS.textMuted },
  tabTextActive: { color: COLORS.navy },
  loanCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 12,
  },
  loanCardActive: { borderTopWidth: 3, borderTopColor: COLORS.navy },
  loanTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 8,
  },
  folioText: { fontSize: 11, fontWeight: "800", color: COLORS.redAccent },
  itemTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navy,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillFinished: { backgroundColor: "#f1f5f9" },
  statusText: { fontSize: 11, fontWeight: "800", color: COLORS.navy },
  statusTextFinished: { color: "#475569" },
  metaGrid: { flexDirection: "row", marginTop: 10, gap: 8 },
  metaCol: { flex: 1 },
  metaLabel: { fontSize: 11, color: COLORS.textMuted },
  metaValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMain,
    marginTop: 2,
  },
  pendingBanner: {
    marginTop: 12,
    backgroundColor: COLORS.redSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pendingBannerText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.redAccent,
  },
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
});

export default MyLoansScreen;
