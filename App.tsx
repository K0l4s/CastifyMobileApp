
import React, { useEffect, useState } from 'react';
import { LinkingOptions, NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './src/screens/SplashScreen';
import MainScreen from './src/screens/MainScreen';
import { RootParamList } from './src/type/navigationType';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import Toast from 'react-native-toast-message';
import ProfileScreen from './src/screens/ProfileScreen';
import PodcastScreen from './src/screens/PodcastScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import RegisterFinalScreen from './src/screens/RegisterFinalScreen';
import { Linking } from 'react-native';
import FallbackScreen from './src/screens/FallbackScreen';
import VerifySuccessScreen from './src/screens/VerifySuccessScreen';
//import ConversationScreen from './src/screens/ConversationScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetProvider } from './src/context/BottomSheetContext';
import NotificationScreen from './src/screens/NotificationScreen';
import CreateScreen from './src/screens/CreateScreen';
import ChatSettingScreen from './src/screens/ChatSettingScreen';
const Stack = createStackNavigator<RootParamList>();
import useStomp from './src/hooks/useStomp';
// Cấu hình Deep Link
const linking: LinkingOptions<RootParamList> = {
  prefixes: ["castify://", "https://castify.vercel.app"], // Các URL scheme
  config: {
    screens: {
      Verify: {
        path: "verify",
        parse: {
          token: (token: string) => `${token}`,
        },
      },
    },
  },
};

// Main App
const App = () => {
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      console.log("Deep Link Received:", event.url);
    };

    // Lắng nghe deep link khi app đang mở
    Linking.addEventListener("url", handleDeepLink);

    // Xử lý deep link khi app được mở từ trạng thái đóng
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      Linking.removeAllListeners("url");
    };
  }, []);


  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetProvider>
          <NavigationContainer linking={linking} fallback={<FallbackScreen />}>
            <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#fff' } }}>
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Main" component={MainScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Podcast" component={PodcastScreen} />
              <Stack.Screen name="Verify" component={VerifyScreen} />
              <Stack.Screen name="RegisterFinal" component={RegisterFinalScreen} />
              <Stack.Screen name="VerifySuccess" component={VerifySuccessScreen} />
              <Stack.Screen name="Notification" component={NotificationScreen} />
              <Stack.Screen name="ChatDetailScreen" component={ChatDetailScreen} options={{ headerShown: true }} />
              <Stack.Screen name="ChatSettingScreen" component={ChatSettingScreen} options={{ headerShown: true }} />
              <Stack.Screen name="Create" component={CreateScreen} />
            </Stack.Navigator>
            <Toast />
          </NavigationContainer>
        </BottomSheetProvider>
      </GestureHandlerRootView>
    </Provider>
  );
};

export default App;
