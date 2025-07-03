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
} from "react-native";
import { saveItems, getItems } from "../utils/storage";
import InfoCard from "../component/InfoCard";

const numColumns = 2;
const screenWidth = Dimensions.get("window").width;
const cardMargin = 20;
const cardWidth = (screenWidth - (numColumns + 2) * cardMargin) / numColumns;

export default function Home({ navigation }) {
  // const data = [
  //   {
  //     id: "1",
  //     work: "connected",
  //     title: "Gamma1",
  //     hash: "120 TH/s",
  //     AsicT: "50°C",
  //     VrT: "65°C",
  //     value4: "XX",
  //   },
  //   {
  //     id: "2",
  //     work: "connected",
  //     title: "Gamma1",
  //     hash: "120 TH/s",
  //     AsicT: "50°C",
  //     VrT: "65°C",
  //     value4: "XX",
  //   },
  //   {
  //     id: "3",
  //     work: "connected",
  //     title: "Gamma1",
  //     hash: "120 TH/s",
  //     AsicT: "50°C",
  //     VrT: "65°C",
  //     value4: "XX",
  //   },
  // ];
  const [data, setData] = useState(null); // 'e como esta voltando a data do fetch tenho que acertar
  const [text, setText] = useState("");

  const fetchData = async () => {
    try {
      const response = await fetch("http://10.0.0.163/api/system/info");
      const json = await response.json();
      setData(json);
      formatHashrate(data.hashRate);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const addItem = async () => {
    if (!text.trim()) return Alert.alert("Digite algo válido.");

    const currentItems = await getItems();
    const updatedItems = [...currentItems, { id: Date.now(), text }];
    await saveItems(updatedItems);
    setText("");
    Alert.alert("Adicionado!");
  };

  //os cards
  const renderItem = ({ item }) => (
    <View style={{ width: cardWidth, margin: cardMargin / 2 }}>
      <TouchableOpacity>
        <InfoCard
          title={item.title}
          work={item.work}
          hash={item.hash}
          AsicT={item.AsicT}
          VrT={item.VrT}
          value4={item.value4}
        />
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 4000);
    return () => clearInterval(intervalId);
  }, []);

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Carregando informações do sistema...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.holeInput}>
        <TextInput
          style={styles.input}
          placeholder="Type IP"
          value={text}
          onChangeText={setText}
        />
        <View style={styles.buttonRow}>
          <Button title="Add" onPress={addItem} />
          <Button
            title="List"
            onPress={() => navigation.navigate("PaginaIP")}
          />
        </View>
      </View>
      <View>
        <FlatList
          contentContainerStyle={styles.containerFlat}
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={numColumns}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  holeInput: { flexDirection: "row", justifyContent: "space-between" },
  input: { borderWidth: 1, padding: 10, width: "60%" },
  buttonRow: {
    flexDirection: "row", // Deixa os itens lado a lado
    justifyContent: "space-between", // Espaçamento entre eles
    gap: 10, // Se estiver usando React Native 0.71+
  },
  containerFlat: {
    marginTop: 10,
  },
});
