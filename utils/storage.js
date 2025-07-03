import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "ipList";

export const getItems = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveItems = async (items) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};
