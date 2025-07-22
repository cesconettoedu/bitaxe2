import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

const InfocardNano = ({
  ipIndividual,
  hashRate,
  hashAvg,
  diffAccepted,
  foundBlocks,
}) => {
  function formatHashrate(hash) {
    if (hash >= 1000) return (hash / 1000000).toFixed(2) + " TH/s";
    if (hash <= 999) return hash.toFixed(2) + " GH/s";
  }

  function formatDifficulty(diff) {
    if (diff >= 1e12) {
      return (diff / 1e12).toFixed(2) + " T";
    } else if (diff >= 1e9) {
      return (diff / 1e9).toFixed(2) + " G";
    } else if (diff >= 1e6) {
      return (diff / 1e6).toFixed(2) + " M";
    } else {
      return diff;
    }
  }

  useEffect(() => {
    formatHashrate();
    formatDifficulty();
  }, []);

  return (
    <View style={styles.card}>
      {/* <View style={styles.inline}>
        <Text style={styles.title}>{title.replace("duducesc.", "")}</Text>
        <Text style={styles.statusIcon}>
          {work === "Connected!" ? "🟢" : "🔴"}
        </Text>
      </View> */}
      <Text style={styles.titleIp}>IP: {ipIndividual}</Text>
      <Text style={styles.titleIp}>Hash: {formatHashrate(hashRate)}</Text>
      <Text style={styles.titleIp}>Avg H: {formatHashrate(hashAvg)}</Text>
      <Text style={styles.titleIp}>
        Best diff:{" "}
        <Text style={{ fontWeight: "bold" }}>
          {formatDifficulty(diffAccepted)}
        </Text>
      </Text>
      <Text style={styles.titleIp}>foundBlocks: {foundBlocks}</Text>
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
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: "#555",
  },
  inline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 5,
  },
  inlineB: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15,
    marginRight: 5,
  },
  statusIcon: {
    flex: 1,
    textAlign: "right",
  },
});

export default InfocardNano;
