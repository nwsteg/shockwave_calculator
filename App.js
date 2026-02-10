import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator, DrawerToggleButton } from "@react-navigation/drawer";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CondensationScreen from "./src/screens/CondensationScreen";
import IsentropicScreen from "./src/screens/IsentropicScreen";
import NormalShockScreen from "./src/screens/NormalShockScreen";
import ObliqueShockScreen from "./src/screens/ObliqueShockScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import { ProfileProvider } from "./src/utils/ProfileContext";

const Drawer = createDrawerNavigator();

function HeaderMenuIndicator(props) {
  return (
    <View style={styles.menuIndicator}>
      <DrawerToggleButton {...props} />
      <Text style={styles.menuLabel}>Menu</Text>
    </View>
  );
}

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
              headerLeft: (props) => <HeaderMenuIndicator {...props} />,
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

const styles = StyleSheet.create({
  menuIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginLeft: -2,
  },
});
