import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { getItems, saveItems } from "../utils/storage";

export default function PaginaIP({ navigation, route }) {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const loadItems = async () => {
    const data = await getItems();
    setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const deleteItem = async (id) => {
    const newItems = items.filter((item) => item.id !== id);
    await saveItems(newItems);
    setItems(newItems);
    // Atualiza Home ao retornar
    route.params?.onReturn?.();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingText(item.text);
  };

  const saveEdit = async () => {
    const updated = items.map((item) =>
      item.id === editingId ? { ...item, text: editingText } : item
    );
    await saveItems(updated);
    setItems(updated);
    setEditingId(null);
    setEditingText("");

    // Atualiza Home ao retornar
    route.params?.onReturn?.();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : index.toString()
        }
        renderItem={({ item }) => {
          const isEditing = editingId === item.id;

          return (
            <View style={styles.item}>
              {isEditing ? (
                // Apenas UM bloco de edição
                <View>
                  <TextInput
                    style={styles.input}
                    value={editingText}
                    onChangeText={setEditingText}
                  />
                  <View style={styles.buttonRow}>
                    <Button title="Salvar" onPress={saveEdit} />
                    <Button
                      title="Cancelar"
                      onPress={() => setEditingId(null)}
                    />
                  </View>
                </View>
              ) : (
                // Apenas UM bloco visual
                <View style={styles.holeInput}>
                  <Text style={styles.text}>{item.text}</Text>
                  {/* <Text style={styles.text}>name:{item.text}</Text> */}
                  <View style={styles.buttonRow}>
                    <Button title="Editar" onPress={() => startEdit(item)} />
                    <Button
                      title="Excluir"
                      onPress={() => deleteItem(item.id)}
                    />
                  </View>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 10,
  },
  holeInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    fontSize: 16,
    marginBottom: 10,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
  },
  text: {
    fontSize: 16,
    flexShrink: 1,
  },
});
