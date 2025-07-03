import React from "react";
import { View, Text, StyleSheet } from "react-native";

const InfoCard = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Gamma1 Connected</Text>
      <Text style={styles.value}>12 TH/s</Text>
      <Text style={styles.value}>Asic T: 60 C</Text>
      <Text style={styles.value}>VoltR T: 70 C</Text>
      <Text style={styles.value}>XXXX</Text>
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

export default InfoCard;
