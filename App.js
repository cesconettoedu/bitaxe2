// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import Home from "./screens/Home";
// import PaginaIP from "./screens/PaginaIP";
// import Nanos from "./screens/Nanos";

// const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator
//         // screenOptions={{
//         //   headerTitleStyle: { fontSize: 16 },
//         //   headerStyle: { height: 5 },
//         //   headerTitleAlign: "center",
//         // }}
//         screenOptions={{
//           headerShown: false, // remove o título e o header completamente
//         }}
//       >
//         <Stack.Screen name="Home" component={Home} />
//         <Stack.Screen name="PaginaIP" component={PaginaIP} />
//         <Stack.Screen name="Nanos" component={Nanos} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

import Home from "./screens/Home";
import PaginaIP from "./screens/PaginaIP";
import Nanos from "./screens/Nanos";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false, // remove o título e o cabeçalho
            }}
          >
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="PaginaIP" component={PaginaIP} />
            <Stack.Screen name="Nanos" component={Nanos} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    backgroundColor: "#fff", // ou a cor de fundo que quiser
  },
});
