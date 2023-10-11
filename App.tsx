/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import HomeScreen from './src/screens/HomeScreen';
import DiscoverScreen from './src/screens/DiscoverScreen';
import SearchScreen from './src/screens/SearchScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { 
  DarkTheme,
  Theme,
} from './src/defaults/ui'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme as DarkThemeNav, DefaultTheme as DefaultThemeNav, NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import {
  MD2LightTheme as DefaultThemePaper,
  MD2DarkTheme as DarkThemePaper,
  PaperProvider,
} from 'react-native-paper';

const DarkThemePaperModified = {
  ...DarkThemePaper,
  colors: {
    ...DarkThemePaper,
    notification: DarkTheme.colors.tabNotification
  }
}

const DefaultThemePaperModified = {
  ...DefaultThemePaper,
  colors: {
    ...DefaultThemePaper,
    notification: Theme.colors.tabNotification
  }
}

const Tab = createMaterialBottomTabNavigator();
const Stack = createNativeStackNavigator();

function App(): JSX.Element {

  return (
    <SafeAreaProvider>
      <PaperProvider  theme={useColorScheme() === 'dark' ? DarkThemePaperModified : DefaultThemePaperModified}>
        <NavigationContainer 
          theme={useColorScheme() === 'dark' ? DarkThemeNav : DefaultThemeNav}
        >
          <Stack.Navigator 
            screenOptions={{
              headerShown: false
            }}
            >
            <Stack.Screen
              name="Tabs"
              component={Tabs}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

function Tabs(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const currentTheme = isDarkMode ? DarkTheme : Theme;

  return (
      <Tab.Navigator
        initialRouteName="Home"
        activeColor={currentTheme.colors.tabActive}
        inactiveColor={currentTheme.colors.tabAccent}
        barStyle={{ backgroundColor: currentTheme.colors.tabBackgound }}
      >
        <Tab.Screen 
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="home" color={color} size={26} />
            ),
          }}
        />
        <Tab.Screen
          name="Discover"
          component={DiscoverScreen}
          options={{
            tabBarLabel: 'Discover',
            tabBarBadge: true, //2 for instance
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="compass" color={color} size={26} />
            ),
          }}
        />
        <Tab.Screen 
          name="Search"
          component={SearchScreen}
          options={{
            tabBarLabel: 'Search',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="magnify-expand" color={color} size={26} />
            ),
          }}  
        />
        <Tab.Screen 
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="cog" color={color} size={26} />
            ),
          }}
        />
      </Tab.Navigator>
  );
}

// type SectionProps = PropsWithChildren<{
//   title: string;
//   theme: typeof Theme;
// }>;

// function Section({children, title, theme}: SectionProps): JSX.Element {
//   return (
//     <View style={styles.sectionContainer}>
//       <Text
//         style={[
//           styles.sectionTitle,
//           {
//             color: theme.colors.secondary,
//           },
//         ]}>
//         {title}
//       </Text>
//       <Text
//         style={[
//           styles.sectionDescription,
//           {
//             color: theme.colors.secondary,
//           },
//         ]}>
//         {children}
//       </Text>
//     </View>
//   );
// }

// function App(): JSX.Element {
//   const isDarkMode = useColorScheme() === 'dark';
//   const currentTheme = isDarkMode ? DarkTheme : Theme;

//   const backgroundStyle = {
//     backgroundColor: currentTheme.colors.primary
//   };

//   return (
//     <SafeAreaView style={backgroundStyle}>
//       <StatusBar
//         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//         backgroundColor={backgroundStyle.backgroundColor}
//       />



//       {/* <ScrollView
//         contentInsetAdjustmentBehavior="automatic"
//         style={backgroundStyle}>
//         <View
//           style={{
//             backgroundColor: currentTheme.colors.primary,
//           }}>
//           <Section title="Step One" theme={currentTheme}>
//             Edit <Text style={styles.highlight}>App.tsx</Text> to change this
//             screen and then come back to see your edits.
//           </Section>
//         </View>
//       </ScrollView> */}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//   },
//   highlight: {
//     fontWeight: '700',
//   },
// });

export default App;
