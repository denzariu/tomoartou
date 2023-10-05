/**
 * @format
 */

import {AppRegistry, useColorScheme} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';

function Wrapper() {
  <NavigationContainer theme={useColorScheme() === 'dark' ? DarkTheme : DefaultTheme}>
    <App></App>
  </NavigationContainer>
}

AppRegistry.registerComponent(appName, () => App);
