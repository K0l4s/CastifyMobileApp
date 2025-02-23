import React, { useEffect } from 'react';
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
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { BaseApi } from './src/utils/axiosInstance';


const Stack = createStackNavigator<RootParamList>();

// Main App
const App = () => {
  const stompClientRef = React.useRef<Client | null>(null);
  useEffect(() => {
    console.log("🔄 Khởi tạo WebSocket...");

    const socket = new SockJS(BaseApi + "/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrb2xhcyIsImlhdCI6MTc0MDA3Nzc3NSwiZXhwIjoxNzQwMTY0MTc1fQ.47LESZIw6Au_iO485-H4i5rFdVLFjWguYgf_BpQf1cI"}`,
      },
      onConnect: () => {
        console.log("✅ WebSocket connected successfully");

        // 📥 Nhận tin nhắn trong nhóm hiện tại


        // 🔔 Nhận thông báo tin nhắn cá nhân
        stompClient.subscribe(
          `/user/67b4cb7efb70915589b7b276/queue/msg`,
          (message) => {
            const notification = JSON.parse(message.body);
            console.log("🔔 New message notification:", notification);
            // dispatch(receiveMsg(notification));
            // checkNotificationPermission();
            // Kiểm tra xem người dùng có đang ở đúng group không
            // toast.info("Hello");

          }
        );
      },
      onDisconnect: () => {
        console.log("❎ WebSocket disconnected");
      },
      onStompError: (frame) => {
        console.error("🚨 Broker reported error: " + frame.headers["message"]);
        console.error("📄 Additional details: " + frame.body);
      },
      onWebSocketError: (error) => {
        console.error("🔌 WebSocket error:", error);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      console.log("🔄 Cleaning up WebSocket...");
      stompClient.deactivate();
    };
  }, []);
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
