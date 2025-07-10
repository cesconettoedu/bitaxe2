import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { getItems, saveItems } from "../utils/storage";
import { v4 as uuidv4 } from "uuid";

export default function PaginaIP() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Carrega dados do storage (home + nano)
  const loadItems = async () => {
    try {
      const homeItems = await getItems();
      const nanoJson = await AsyncStorage.getItem("nano_ips");
      const nanoItems = nanoJson ? JSON.parse(nanoJson) : [];

      // Junta os dois tipos, com a tag source para identificar
      const allItems = [
        ...homeItems.map((item) => ({ ...item, source: "home" })),
        ...nanoItems.map((item) => ({ ...item, source: "nano" })),
      ];

      setItems(allItems);
    } catch (error) {
      Alert.alert("Erro ao carregar dados");
      console.error(error);
    }
  };

  // Recarrega os dados toda vez que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  // Começa edição
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingText(item.text || item.ip || "");
  };

  // Salva edição
  const saveEdit = async () => {
    try {
      const updatedItems = items.map((item) => {
        if (item.id === editingId) {
          if (item.source === "home") {
            return { ...item, text: editingText };
          } else {
            return { ...item, ip: editingText };
          }
        }
        return item;
      });

      // Salva separadamente home e nano no AsyncStorage
      const homeToSave = updatedItems.filter((item) => item.source === "home");
      const nanoToSave = updatedItems.filter((item) => item.source === "nano");

      await saveItems(homeToSave.map(({ source, ...rest }) => rest));
      await AsyncStorage.setItem(
        "nano_ips",
        JSON.stringify(nanoToSave.map(({ source, ...rest }) => rest))
      );

      setItems(updatedItems);
      setEditingId(null);
      setEditingText("");
    } catch (error) {
      Alert.alert("Erro ao salvar edição");
      console.error(error);
    }
  };

  // Deleta item
  const deleteItem = async (id, source) => {
    try {
      if (source === "home") {
        const homeItems = items.filter(
          (item) => !(item.id === id && item.source === "home")
        );
        await saveItems(
          homeItems
            .filter((item) => item.source === "home")
            .map(({ source, ...rest }) => rest)
        );
      } else if (source === "nano") {
        const nanoItems = items.filter(
          (item) => !(item.id === id && item.source === "nano")
        );
        await AsyncStorage.setItem(
          "nano_ips",
          JSON.stringify(
            nanoItems
              .filter((item) => item.source === "nano")
              .map(({ source, ...rest }) => rest)
          )
        );
      }

      // Atualiza lista após deletar
      loadItems();
    } catch (error) {
      Alert.alert("Erro ao deletar item");
      console.error(error);
    }
  };

  // Renderiza cada item da lista
  const renderItem = ({ item }) => {
    const isEditing = editingId === item.id;

    return (
      <View style={styles.item}>
        {isEditing ? (
          <View>
            <TextInput
              style={styles.input}
              value={editingText}
              onChangeText={setEditingText}
              autoFocus
            />
            <View style={styles.buttonRow}>
              <Button title="Salvar" onPress={saveEdit} />
              <Button title="Cancelar" onPress={() => setEditingId(null)} />
            </View>
          </View>
        ) : (
          <View style={styles.row}>
            <Text style={styles.text}>
              {item.text || item.ip}{" "}
              <Text style={styles.source}>[{item.source}]</Text>
            </Text>
            <View style={styles.buttonRow}>
              <Button title="Editar" onPress={() => startEdit(item)} />
              <Button
                title="Excluir"
                onPress={() => deleteItem(item.id, item.source)}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum IP adicionado</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: { fontSize: 16, flexShrink: 1 },
  source: { fontSize: 12, color: "#999" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 5,
    gap: 10,
  },
  emptyText: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
});
