import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  Dimensions,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import InfocardNano from "../component/InfocardNano";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const numColumns = 2;
const screenWidth = Dimensions.get("window").width;
const cardMargin = 20;
const cardWidth = (screenWidth - (numColumns + 2) * cardMargin) / numColumns;

export default function Nanos() {
  const [nanoIps, setNanoIps] = useState([]);
  const [data, setData] = useState([]);
  const [text, setText] = useState("");
  const [countdown, setCountdown] = useState(30);
  const shownAlerts = useRef(new Set());
  const previousFoundBlocks = useRef({});
  const countdownRef = useRef(null);
  const refreshTimeoutRef = useRef(null);

  const loadNanoIps = async () => {
    const json = await AsyncStorage.getItem("nano_ips");
    const list = json ? JSON.parse(json) : [];
    setNanoIps(list);
    fetchData(list);
    startCountdownAndRefresh(list);
  };

  const saveNanoIps = async (list) => {
    await AsyncStorage.setItem("nano_ips", JSON.stringify(list));
  };

  const addNanoIp = async () => {
    const trimmed = text.trim();
    if (!trimmed) return Alert.alert("Enter a valid IP.");

    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(trimmed)) {
      return Alert.alert("Invalid IP", "Example: 10.0.0.42");
    }

    const normalizedInput = trimmed;
    const existing = nanoIps.find((item) => item.ip.trim() === normalizedInput);

    if (existing) {
      return Alert.alert(
        "IP already added",
        `${normalizedInput} is already in the list.`
      );
    }

    const updated = [...nanoIps, { id: Date.now(), ip: normalizedInput }];
    await saveNanoIps(updated);
    setText("");
    setNanoIps(updated);
    fetchData(updated);
    startCountdownAndRefresh(updated);
  };

  const fetchData = async (ips) => {
    const uniqueIps = Array.from(
      new Map(ips.map((item) => [item.ip, item])).values()
    );

    const results = await Promise.all(
      uniqueIps.map(async (item) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        try {
          const res = await fetch(
            `http://10.0.0.30:3000/summary?ip=${item.ip}`,
            {
              method: "GET",
              signal: controller.signal,
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                Accept: "application/json",
                "User-Agent": "React-Native-App",
              },
            }
          );

          clearTimeout(timeoutId);

          const json = await res.json();
          return { ip: item.ip, data: json, error: false };
        } catch (err) {
          clearTimeout(timeoutId);
          return {
            ip: item.ip,
            data: null,
            error: true,
            errorMessage:
              err.name === "AbortError" ? "Request timed out" : err.message,
          };
        }
      })
    );

    setData(results);
  };

  const startCountdownAndRefresh = (ips) => {
    clearInterval(countdownRef.current);
    clearTimeout(refreshTimeoutRef.current);

    let timeLeft = 10;
    setCountdown(timeLeft);

    countdownRef.current = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(countdownRef.current);
      }
    }, 1000);

    refreshTimeoutRef.current = setTimeout(() => {
      fetchData(ips);
      startCountdownAndRefresh(ips);
    }, 10000);
  };

  useEffect(() => {
    loadNanoIps();

    return () => {
      clearInterval(countdownRef.current);
      clearTimeout(refreshTimeoutRef.current);
    };
  }, []);

  const openInBrowser = (ip) => {
    const url = `http://${ip}`;
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open browser:", err)
    );
  };

  const ItemCard = ({ item }) => {
    const foundBlocksValue = item.data?.foundBlocks;

    if (
      typeof foundBlocksValue === "number" &&
      foundBlocksValue > 0 &&
      previousFoundBlocks.current[item.ip] === 0 &&
      !shownAlerts.current.has(`block-${item.ip}`)
    ) {
      Alert.alert(
        "🎉 Novo Bloco Encontrado",
        `Nano ${item.ip} encontrou ${foundBlocksValue} bloco(s)!`
      );
      shownAlerts.current.add(`block-${item.ip}`);
    }

    previousFoundBlocks.current[item.ip] = foundBlocksValue || 0;

    if (item.error) {
      return (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Error: {item.ip}</Text>
          <Text style={styles.errorMessage}>
            {item.errorMessage || "Could not fetch data"}
          </Text>
        </View>
      );
    }

    const hashRateValue = parseFloat(item.data?.hashRate);
    if (
      !isNaN(hashRateValue) &&
      hashRateValue < 999 &&
      !shownAlerts.current.has(item.ip)
    ) {
      Alert.alert(
        "⚠️ HashRate LOW",
        `Nano ${item.ip} is hashing only ${hashRateValue}`
      );
      shownAlerts.current.add(item.ip);
    }

    return (
      <TouchableOpacity
        style={{ width: cardWidth, margin: cardMargin / 2 }}
        onPress={() => openInBrowser(item.ip)}
      >
        <InfocardNano
          ipIndividual={item?.ip || "N/A"}
          hashRate={item.data?.hashRate || "N/A"}
          hashAvg={item.data?.hashAvg || "N/A"}
          foundBlocks={item.data?.foundBlocks || "0"}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Controls */}
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons
          name="ip-network"
          size={22}
          color="#888"
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.inputField}
          placeholder="Nano IP (ex: 10.0.0.11)"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity onPress={addNanoIp} style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Countdown */}
      <View style={styles.networkStatus}>
        <Text
          style={{
            fontSize: 12,
            color: "#555",
            marginBottom: 8,
            alignSelf: "center",
          }}
        >
          Refresh: {countdown}s
        </Text>
      </View>

      {/* List */}
      <FlatList
        contentContainerStyle={styles.containerFlat}
        data={data}
        keyExtractor={(item, index) => `${item.ip}-${index}`}
        renderItem={({ item }) => <ItemCard item={item} />}
        numColumns={numColumns}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No Nano IPs added yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "center",
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  addButton: {
    backgroundColor: "#1976D2",
    padding: 10,
    borderRadius: 50,
    marginLeft: 8,
  },
  clearButton: {
    backgroundColor: "#D32F2F",
    padding: 10,
    borderRadius: 50,
    marginLeft: 8,
  },
  containerFlat: {
    alignItems: "flex-start",
  },
  emptyText: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
  errorCard: {
    width: cardWidth,
    margin: cardMargin / 2,
    backgroundColor: "#fcc",
    borderRadius: 8,
    padding: 10,
  },
  errorTitle: {
    color: "#900",
    fontWeight: "bold",
  },
  errorMessage: {
    color: "#555",
    fontSize: 12,
  },
  networkStatus: {
    backgroundColor: "#e8f5e8",
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
});
