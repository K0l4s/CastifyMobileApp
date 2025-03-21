import React, { useEffect } from 'react';
import HomeScreen from '../screens/HomeScreen';
import FollowingScreen from './FollowingScreen';
import ChatScreen from './ChatScreen';
import InboxScreen from './NotificationScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import Icon from 'react-native-vector-icons/Ionicons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../type/navigationType';

enableScreens();

const Tab = createMaterialTopTabNavigator();

const MainScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1}}>
        <Tab.Navigator
          tabBarPosition="bottom"
          screenOptions={({ route }) => ({
            headerShown: false,
            swipeEnabled: false,
            tabBarShowLabel: true,
            tabBarStyle: { backgroundColor: '#fff' },
            tabBarLabel: ({ focused, color }) => {
              let label;
              if (route.name === 'Home') {
                label = 'Home';
              } else if (route.name === 'Following') {
                label = 'Following';
              } else if (route.name === 'CreateButton') {
                return null;
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
              } else if (route.name === 'Chat') {
                iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              } else if (route.name === 'Inbox') {
                iconName = focused ? 'mail' : 'mail-outline';
              }

              return <Icon name={iconName} size={20} color={focused ? '#0c0461' : 'gray'} />;
            },
            tabBarButton: (props: any) => {
              if (route.name === 'CreateButton') {
                return null;
              }
              return <TouchableOpacity {...props} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Following" component={FollowingScreen} />
          <Tab.Screen
            name="CreateButton"
            component={View}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                e.preventDefault(); // Ngăn chặn click vào tab
              },
            })}
          />
          <Tab.Screen name="Chat" component={ChatScreen} />
          <Tab.Screen name="Inbox" component={InboxScreen} />
        </Tab.Navigator>
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: [{ translateX: -20 }],
            backgroundColor: '#0c0461',
            borderRadius: 50,
            padding: 0,
            zIndex: 1,
          }}
          onPress={() => navigation.navigate('Create')}
        >
          <Icon name="add-circle" size={40} color="#fff" />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

export default MainScreen;