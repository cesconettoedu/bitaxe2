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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveItems, getItems } from "../utils/storage";
import Infocard from "../component/Infocard";

const numColumns = 2;
const screenWidth = Dimensions.get("window").width;
const cardMargin = 20;
const cardWidth = (screenWidth - (numColumns + 2) * cardMargin) / numColumns;

export default function Home({ navigation }) {
  const [data, setData] = useState([]); // aqui guardaremos array com dados de todos IPs
  const [text, setText] = useState("");
  const [storedItems, setStoredItems] = useState([]);

  // Função que carrega IPs do AsyncStorage e salva no estado
  const loadStoredItems = async () => {
    const items = await getItems();
    setStoredItems(items);
  };

  // Função que faz fetch em TODOS os IPs e guarda resultado em 'data'
  const fetchDataFromAllIps = async () => {
    try {
      const items = await getItems(); // carrega IPs
      setStoredItems(items);

      // Promise.all para buscar em paralelo
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

  // Adicionar novo IP ao AsyncStorage e atualizar lista
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

  // Atualizar lista e dados a cada 4 segundos
  useEffect(() => {
    fetchDataFromAllIps();
    const intervalId = setInterval(fetchDataFromAllIps, 4000);
    return () => clearInterval(intervalId);
  }, []);

  // Componente para renderizar cada item do FlatList
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
        <TouchableOpacity>
          <Infocard
            title={`${item.data.stratumUser}`}
            work={item.data?.work || "N/A"}
            hash={item.data?.hashRate || "N/A"}
            AsicT={item.data?.temp || "N/A"}
            VrT={item.data?.VrT || "N/A"}
            value4={item.data?.value4 || "N/A"}
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
            onPress={() => navigation.navigate("PaginaIP")}
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
