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
import { saveItems, getItems } from "../utils/storage";
import Infocard from "../component/Infocard";

const numColumns = 2;
const screenWidth = Dimensions.get("window").width;
const cardMargin = 20;
const cardWidth = (screenWidth - (numColumns + 2) * cardMargin) / numColumns;

export default function Home({ navigation }) {
  const [data, setData] = useState([]);
  const [text, setText] = useState("");
  const [storedItems, setStoredItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // 👈 Novo estado

  const loadStoredItems = async () => {
    const items = await getItems();
    setStoredItems(items);
  };

  const fetchDataFromAllIps = async () => {
    try {
      const items = await getItems();
      setStoredItems(items);

      const results = await Promise.all(
        items.map(async (item) => {
          const ip = item.text;
          try {
            const response = await fetch(`http://${ip}/api/system/info`);
            const json = await response.json();
            return { ip, data: json, error: false };
          } catch (error) {
            console.error(`Erro ao buscar dados de ${ip}:`, error);
            return { ip, data: null, error: true };
          }
        })
      );

      setData(results);
    } catch (error) {
      console.error("Erro geral ao buscar dados:", error);
    }
  };

  // 👇 Novo: Função de refresh ao puxar
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDataFromAllIps();
    setRefreshing(false);
  };

  const addIp = async () => {
    if (!text.trim()) return Alert.alert("Digite algo válido.");
    const currentItems = await getItems();
    const updatedItems = [...currentItems, { id: Date.now(), text }];
    await saveItems(updatedItems);
    setText("");
    await loadStoredItems();
    await fetchDataFromAllIps();
    Alert.alert("Adicionado!");
  };

  useEffect(() => {
    fetchDataFromAllIps();
    const intervalId = setInterval(fetchDataFromAllIps, 4000);
    return () => clearInterval(intervalId);
  }, []);

  const openInBrowser = (ip) => {
    const url = `http://${ip}`;
    Linking.openURL(url).catch((err) =>
      console.error("Erro ao abrir o navegador:", err)
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
          }}
        >
          <Text>Erro ao buscar dados de {item.ip}</Text>
        </View>
      );
    }

    return (
      <View style={{ width: cardWidth, margin: cardMargin / 2 }}>
        <TouchableOpacity onPress={() => openInBrowser(item.ip)}>
          <Infocard
            work={item.data?.wifiStatus || "off"}
            title={`${item.data.stratumUser}`}
            ipIndividual={item?.ip || "N/A"}
            hash={item.data?.hashRate || "N/A"}
            AsicT={item.data?.temp || "N/A"}
            VrT={item.data?.vrTemp || "N/A"}
            InputVol={item.data?.voltage || "N/A"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.holeInput}>
        <TextInput
          style={styles.input}
          placeholder="Digite IP"
          value={text}
          onChangeText={setText}
          autoCapitalize="none"
          keyboardType="numeric"
        />
        <View style={styles.buttonRow}>
          <Button title="Add" onPress={addIp} />
          <Button
            title="List"
            onPress={() =>
              navigation.navigate("PaginaIP", {
                onReturn: () => fetchDataFromAllIps(), // 👈 função que atualiza a Home
              })
            }
          />
        </View>
      </View>

      <FlatList
        contentContainerStyle={styles.containerFlat}
        data={data}
        keyExtractor={(item) => item.ip}
        renderItem={({ item }) => <ItemCard item={item} />}
        numColumns={numColumns}
        ListEmptyComponent={<Text>Nenhum dado carregado.</Text>}
        refreshing={refreshing} // 👈 pull to refresh
        onRefresh={handleRefresh} // 👈 função chamada ao puxar
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  holeInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  input: { borderWidth: 1, padding: 10, width: "60%" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  containerFlat: {
    marginTop: 10,
  },
});
