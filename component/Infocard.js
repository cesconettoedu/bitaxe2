import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

const Infocard = ({ title, work, hash, AsicT, VrT, value4 }) => {
  function formatHashrate(hash) {
    if (hash >= 1000) return (hash / 1000).toFixed(2) + " TH/s";
    if (hash <= 999) return hash.toFixed(2) + " GH/s";
  }

  useEffect(() => {
    formatHashrate();
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title.replace("duducesc.", "")}</Text>
      <Text style={styles.value}>{work}</Text>
      <Text style={styles.value}>{formatHashrate(hash)}</Text>
      <Text style={styles.value}>Asic T: {AsicT.toFixed(1)} °C</Text>
      <Text style={styles.value}>VoltR T: {VrT}</Text>
      <Text style={styles.value}>{value4}</Text>
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
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    color: "#555",
  },
});

export default Infocard;
