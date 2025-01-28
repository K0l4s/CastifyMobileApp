import React, { useEffect } from 'react';
import HomeScreen from '../screens/HomeScreen';
import FollowingScreen from './FollowingScreen';
import CreateScreen from './CreateScreen';
import ChatScreen from './ChatScreen';
import InboxScreen from './InboxScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import Icon from 'react-native-vector-icons/Ionicons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Text } from 'react-native';

enableScreens();

const Tab = createMaterialTopTabNavigator();

const MainScreen = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tab.Navigator
        tabBarPosition="bottom"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: { backgroundColor: '#fff' },
          tabBarLabel: ({ focused, color }) => {
            let label;
            if (route.name === 'Home') {
              label = 'Home';
            } else if (route.name === 'Following') {
              label = 'Following';
            } else if (route.name === 'Create') {
              label = 'Create';
            } else if (route.name === 'Chat') {
              label = 'Chat';
            } else if (route.name === 'Inbox') {
              label = 'Inbox';
            }

            return (
              <Text style={{ fontSize: 10, color: focused ? '#0c0461' : 'gray' }}>
                {label}
              </Text>
            );
          },
          tabBarIndicatorStyle: { backgroundColor: '#0c0461' }, // Đường gạch dưới tab
          tabBarIcon: ({ focused, color }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Following') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Create') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Chat') {
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
            } else if (route.name === 'Inbox') {
              iconName = focused ? 'mail' : 'mail-outline';
            }

            return <Icon name={iconName} size={20} color={focused ? '#0c0461' : 'gray'} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Following" component={FollowingScreen} />
        <Tab.Screen name="Create" component={CreateScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Inbox" component={InboxScreen} />
      </Tab.Navigator>
    </GestureHandlerRootView>
  );
};

export default MainScreen;