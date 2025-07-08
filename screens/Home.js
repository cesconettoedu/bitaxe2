import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Text,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { saveItems, getItems } from "../utils/storage";
import Infocard from "../component/Infocard";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const numColumns = 2;
const screenWidth = Dimensions.get("window").width;
const cardMargin = 20;
const cardWidth = (screenWidth - (numColumns + 2) * cardMargin) / numColumns;

export default function Home({ navigation }) {
  const [data, setData] = useState([]);
  const [text, setText] = useState("");
  const [storedItems, setStoredItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(null);

  const checkNetworkConnection = async () => {
    try {
      const state = await NetInfo.fetch();
      setNetworkStatus(state);
      console.log("Network state:", state);

      if (!state.isConnected) {
        Alert.alert("NO internet connection");
        return false;
      }

      if (state.type !== "wifi") {
        console.warn(
          "Not connected via WiFi, there may be problems accessing the local network"
        );
      }

      return true;
    } catch (error) {
      console.error("Error checking connection:", error);
      return false;
    }
  };

  const loadStoredItems = async () => {
    const items = await getItems();
    setStoredItems(items);
  };

  const fetchDataFromSingleIp = async (ip) => {
    try {
      console.log(`Searching for data from: http://${ip}/api/system/info`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 12 segundos timeout

      const response = await fetch(`http://${ip}/api/system/info`, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Accept: "application/json",
          "User-Agent": "React-Native-App",
        },
      });

      clearTimeout(timeoutId);

      console.log(`Response status of ${ip}:`, response.status);
      console.log(`Response Headers ${ip}:`, response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      console.log(`Data received from ${ip}:`, json);
      return { ip, data: json, error: false };
    } catch (error) {
      console.error(`Error fetching data from ${ip}:`, error.message);
      console.error(`Error type for ${ip}:`, error.name);

      // Detalhes específicos do erro
      let errorMessage = "Unknown error";
      if (error.name === "Abort Error") {
        errorMessage = "Timeout - Server did not respond";
      } else if (error.name === "TypeError") {
        errorMessage = "Network Error - Check IP and Connectivity";
      } else if (error.message.includes("HTTP error")) {
        errorMessage = `Erro HTTP: ${error.message}`;
      } else {
        errorMessage = error.message;
      }

      return { ip, data: null, error: true, errorMessage };
    }
  };

  const fetchDataFromAllIps = async () => {
    try {
      // Verifica conexão de rede primeiro
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        console.warn("No network connection, canceling search");
        return;
      }

      const items = await getItems();
      setStoredItems(items);

      if (items.length === 0) {
        console.log("No IP registered");
        setData([]);
        return;
      }

      console.log("Starting data search for all IPs...");

      const results = await Promise.all(
        items.map(async (item) => {
          const ip = item.text;

          // Busca dados diretamente, sem teste de conectividade primeiro
          return await fetchDataFromSingleIp(ip);
        })
      );

      console.log("Search results:", results);
      setData(results);
    } catch (error) {
      console.error("General error fetching data:", error);
      Alert.alert("Error", "Error fetching data from servers");
    }
  };

  const handleRefresh = async () => {
    console.log("Performing manual refresh...");
    setRefreshing(true);
    await fetchDataFromAllIps();
    setRefreshing(false);
  };

  const diagnosticTest = async () => {
    if (!text.trim()) {
      Alert.alert("Enter an IP to test");
      return;
    }

    const ip = text.trim();
    Alert.alert("Testing...", `Checking connectivity with ${ip}`);

    try {
      console.log(`=== DIAGNOSTIC TEST FOR${ip} ===`);

      // Teste 1: Ping básico usando fetch simples
      console.log("Test 1: Basic GET Request");
      const response = await fetch(`http://${ip}/api/system/info`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log(`Status: ${response.status}`);
      console.log(`OK: ${response.ok}`);
      console.log(`Headers:`, response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log("Data received:", data);
        Alert.alert(
          "Success!",
          `Connectivity OK with ${ip}\nStatus: ${response.status}`
        );
      } else {
        Alert.alert("Erro HTTP", `Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Diagnostic test error:", error);
      Alert.alert(
        "Connectivity Error",
        `Erro: ${error.message}\nTipo: ${error.name}`
      );
    }
  };

  const addIp = async () => {
    if (!text.trim()) return Alert.alert("Enter something valid.");

    // Valida formato básico de IP
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/;
    if (!ipPattern.test(text.trim())) {
      return Alert.alert("Invalid IP", "Enter a valid IP (ex: 192.168.1.100)");
    }

    const currentItems = await getItems();
    const updatedItems = [
      ...currentItems,
      { id: Date.now(), text: text.trim() },
    ];
    await saveItems(updatedItems);
    setText("");
    await loadStoredItems();
    await fetchDataFromAllIps();
    Alert.alert("Added!");
  };

  useEffect(() => {
    console.log("Component assembled, starting initial search...");
    fetchDataFromAllIps();

    const intervalId = setInterval(() => {
      console.log("Performing automatic search...");
      fetchDataFromAllIps();
    }, 10000); // Aumentei para 10 segundos para evitar sobrecarga

    return () => {
      console.log("Clearing range");
      clearInterval(intervalId);
    };
  }, []);

  const openInBrowser = (ip) => {
    const url = `http://${ip}`;
    console.log(`Opening in browser: ${url}`);
    Linking.openURL(url).catch((err) =>
      console.error("Error opening browser:", err)
    );
  };

  const ItemCard = ({ item }) => {
    if (item.error) {
      return (
        <View
          style={{
            width: cardWidth,
            margin: cardMargin / 2,
            padding: 10,
            backgroundColor: "#fcc",
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{ color: "#d00", fontWeight: "bold", textAlign: "center" }}
          >
            Erro: {item.ip}
          </Text>
          <Text
            style={{
              color: "#666",
              fontSize: 12,
              textAlign: "center",
              marginTop: 5,
            }}
          >
            {item.errorMessage || "Server not accessible"}
          </Text>
          <TouchableOpacity
            onPress={() =>
              fetchDataFromSingleIp(item.ip).then((result) => {
                const newData = data.map((d) =>
                  d.ip === item.ip ? result : d
                );
                setData(newData);
              })
            }
            style={{
              marginTop: 10,
              padding: 5,
              backgroundColor: "#fff",
              borderRadius: 4,
            }}
          >
            <Text style={{ color: "#d00", fontSize: 12 }}>
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ width: cardWidth, margin: cardMargin / 2 }}>
        <TouchableOpacity onPress={() => openInBrowser(item.ip)}>
          <Infocard
            work={item.data?.wifiStatus || "off"}
            title={`${item.data?.stratumUser || "N/A"}`}
            ipIndividual={item?.ip || "N/A"}
            hash={item.data?.hashRate || "N/A"}
            bestSesionDif={item.data?.bestSessionDiff || "N/A"}
            AsicT={item.data?.temp || "N/A"}
            VrT={item.data?.vrTemp || "N/A"}
            InputVol={item.data?.voltage || "N/A"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.inputWrapper}>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
          onPress={diagnosticTest}
        >
          <MaterialCommunityIcons name="magnify" size={18} color="#fff" />
          <Text style={styles.actionText}>Test</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#2196F3" }]}
          onPress={() =>
            navigation.navigate("PaginaIP", {
              onReturn: () => fetchDataFromAllIps(),
            })
          }
        >
          <MaterialCommunityIcons
            name="clipboard-list"
            size={18}
            color="#fff"
          />
          <Text style={styles.actionText}>IP List</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons
          name="ip-network"
          size={22}
          color="#888"
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.inputField}
          placeholder="Type IP (ex: 10.0.0.1)"
          value={text}
          onChangeText={setText}
          autoCapitalize="none"
          keyboardType="default"
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.addButton} onPress={addIp}>
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Indicador de status de rede */}
      {networkStatus && (
        <View style={styles.networkStatus}>
          <Text style={styles.networkStatusText}>
            Rede: {networkStatus.type} |{" "}
            {networkStatus.isConnected ? "Conected" : "Desconected"}
          </Text>
        </View>
      )}

      <FlatList
        contentContainerStyle={styles.containerFlat}
        data={data}
        keyExtractor={(item) => item.ip}
        renderItem={({ item }) => <ItemCard item={item} />}
        numColumns={numColumns}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No data loaded. Add IPs to get started.
          </Text>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  containerFlat: {
    marginTop: 10,
    alignItems: "flex-start",
  },
  networkStatus: {
    backgroundColor: "#e8f5e8",
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  networkStatusText: {
    fontSize: 12,
    color: "#2d5a2d",
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
  ///////////
  inputWrapper: {
    marginBottom: 15,
    alignItems: "center",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  inputField: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: "#333",
  },

  addButton: {
    backgroundColor: "#1976D2",
    padding: 10,
    borderRadius: 50,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 25,
    width: "80%",
    alignSelf: "center",
  },

  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 6,
  },

  actionText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 14,
  },
});
