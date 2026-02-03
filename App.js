import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import IsentropicScreen from "./src/screens/IsentropicScreen";
import NormalShockScreen from "./src/screens/NormalShockScreen";

const Tab = createBottomTabNavigator();

function PlaceholderScreen({ title, description }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderText}>{description}</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Isentropic" component={IsentropicScreen} />
        <Tab.Screen name="Normal Shock" component={NormalShockScreen} />
        <Tab.Screen
          name="Oblique Shock"
          children={() => (
            <PlaceholderScreen
              title="Oblique Shock"
              description="This tab will cover oblique shock wave calculations soon."
            />
          )}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F5F7FB",
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: "center",
    color: "#4C566A",
  },
});
