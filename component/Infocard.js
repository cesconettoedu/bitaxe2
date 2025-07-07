import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

const Infocard = ({
  work,
  title,
  ipIndividual,
  hash,
  bestSesionDif,
  AsicT,
  VrT,
  InputVol,
}) => {
  function formatHashrate(hash) {
    if (hash >= 1000) return (hash / 1000).toFixed(2) + " TH/s";
    if (hash <= 999) return hash.toFixed(2) + " GH/s";
  }

  useEffect(() => {
    formatHashrate();
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.inline}>
        <Text style={styles.title}>{title.replace("duducesc.", "")}</Text>
        <Text style={styles.statusIcon}>
          {work === "Connected!" ? "🟢" : "🔴"}
        </Text>
      </View>
      <Text style={styles.titleIp}>IP: {ipIndividual}</Text>
      <View style={styles.inline}>
        <Text style={styles.value}>{formatHashrate(hash)}</Text>
        <Text>{(InputVol / 1000).toFixed(1)} V</Text>
      </View>
      <Text style={styles.value}>A: {AsicT.toFixed(1)} °C</Text>
      <Text style={styles.value}>Vr: {VrT.toFixed(1)} °C</Text>
      <Text style={styles.value}>Best Diff: {bestSesionDif}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 2,
    padding: 6,
    borderRadius: 12,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  titleIp: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    color: "#555",
  },
  inline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusIcon: {
    flex: 1,
    textAlign: "right",
  },
});

export default Infocard;
