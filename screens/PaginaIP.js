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
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {editingId === item.id ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editingText}
                  onChangeText={setEditingText}
                />
                <Button title="Salvar" onPress={saveEdit} />
              </>
            ) : (
              <>
                <View style={styles.holeInput}>
                  <Text style={styles.text}>{item.text}</Text>
                  <View style={styles.buttonRow}>
                    <Button title="Editar" onPress={() => startEdit(item)} />
                    <Button
                      title="Excluir"
                      onPress={() => deleteItem(item.id)}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  item: { padding: 10, borderBottomWidth: 1, marginBottom: 10 },
  holeInput: { flexDirection: "row", justifyContent: "space-between" },
  input: { borderWidth: 1, padding: 5, marginBottom: 5 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  text: { fontSize: 16, alignSelf: "center" },
});
