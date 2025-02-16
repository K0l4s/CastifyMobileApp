import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from './src/screens/SplashScreen';
import MainScreen from './src/screens/MainScreen';
import { RootParamList } from './src/type/navigationType';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import Toast from 'react-native-toast-message';
import ProfileScreen from './src/screens/ProfileScreen';
import PodcastScreen from './src/screens/PodcastScreen';


const Stack = createStackNavigator<RootParamList>();

// Main App
const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false, cardStyle: { backgroundColor: '#fff' }}}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen}/>
          <Stack.Screen name="Podcast" component={PodcastScreen}/ >
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </Provider>
  );
};

export default App;
