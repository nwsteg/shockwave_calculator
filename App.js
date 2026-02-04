import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import CondensationScreen from "./src/screens/CondensationScreen";
import IsentropicScreen from "./src/screens/IsentropicScreen";
import NormalShockScreen from "./src/screens/NormalShockScreen";
import ObliqueShockScreen from "./src/screens/ObliqueShockScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Isentropic" component={IsentropicScreen} />
        <Tab.Screen name="Normal Shock" component={NormalShockScreen} />
        <Tab.Screen name="Oblique Shock" component={ObliqueShockScreen} />
        <Tab.Screen name="Condensation" component={CondensationScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
