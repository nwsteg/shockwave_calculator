import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CondensationScreen from "./src/screens/CondensationScreen";
import IsentropicScreen from "./src/screens/IsentropicScreen";
import NormalShockScreen from "./src/screens/NormalShockScreen";
import ObliqueShockScreen from "./src/screens/ObliqueShockScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import { ProfileProvider } from "./src/utils/ProfileContext";

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Drawer.Navigator
            screenOptions={{
              headerTitleStyle: { fontWeight: "700" },
              headerTintColor: "#111827",
              drawerActiveTintColor: "#2563EB",
            }}
          >
            <Drawer.Screen name="Isentropic" component={IsentropicScreen} />
            <Drawer.Screen name="Normal Shock" component={NormalShockScreen} />
            <Drawer.Screen name="Oblique Shock" component={ObliqueShockScreen} />
            <Drawer.Screen name="Condensation" component={CondensationScreen} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
          </Drawer.Navigator>
        </NavigationContainer>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
