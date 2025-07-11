import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./screens/Home";
import PaginaIP from "./screens/PaginaIP";
import Nanos from "./screens/Nanos";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTitleStyle: { fontSize: 16 },
          headerStyle: { height: 5 },
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="PaginaIP" component={PaginaIP} />
        <Stack.Screen name="Nanos" component={Nanos} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
