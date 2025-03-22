import React, { useEffect, useState } from 'react';
import HomeScreen from '../screens/HomeScreen';
import FollowingScreen from './FollowingScreen';
import ChatScreen from './ChatScreen';
import NotificationScreen from './NotificationScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import Icon from 'react-native-vector-icons/Ionicons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../type/navigationType';
import { RootState } from '../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { NotificationService } from '../services/NotificationService';
import { setTotalUnRead } from '../redux/reducer/notificationSlice';
import useStomp from '../hooks/useStomp';
import { NotiModel } from '../models/Notification';

enableScreens();
const Tab = createMaterialTopTabNavigator();

const MainScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();
  const user = useSelector((state: RootState) => state.auth.user);
  const totalUnRead = useSelector((state: RootState) => state.Notification.totalUnRead);
  const dispatch = useDispatch();
  const [newMessage, setNewMessage] = useState<NotiModel>();

  useEffect(() => {
    const fetchTotalUnread = async () => {
      const data = await NotificationService.getTotalUnRead();
      dispatch(setTotalUnRead(data.data.total));
    };
    fetchTotalUnread();
  }, [user, dispatch]);
  const stomp = useStomp({
    subscribeUrl: `/user/${user?.id}/queue/notification`,
    trigger: [],
});

useEffect(() => {
    if (stomp) {
        console.log(stomp);
        setNewMessage(stomp);
        dispatch(setTotalUnRead(totalUnRead + 1));
    }
}, [stomp]);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          tabBarPosition="bottom"
          screenOptions={({ route }) => ({
            headerShown: false,
            swipeEnabled: false,
            tabBarShowLabel: true,
            tabBarStyle: { backgroundColor: '#fff' },
            tabBarLabel: ({ focused }) => {
              let label;
              if (route.name === 'Home') {
                label = 'Home';
              } else if (route.name === 'Following') {
                label = 'Following';
              } else if (route.name === 'CreateButton') {
                return null;
              } else if (route.name === 'Chat') {
                label = 'Chat';
              } else if (route.name === 'Notification') {
                label = 'Notification';
              }

              return (
                <Text style={{ fontSize: 10, color: focused ? '#0c0461' : 'gray' }}>
                  {label}
                </Text>
              );
            },
            tabBarIndicatorStyle: { backgroundColor: '#0c0461' },
            tabBarIcon: ({ focused }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Following') {
                iconName = focused ? 'heart' : 'heart-outline';
              } else if (route.name === 'Chat') {
                iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              } else if (route.name === 'Notification') {
                iconName = focused ? 'notifications' : 'notifications-outline';
              }

              const icon = (
                <Icon name={iconName? iconName : "gift"} size={20} color={focused ? '#0c0461' : 'gray'} />
              );

              if (route.name === 'Notification' && totalUnRead > 0) {
                return (
                  <View style={{ position: 'relative' }}>
                    {icon}
                    <View
                      style={{
                        position: 'absolute',
                        top: -5,
                        right: -10,
                        backgroundColor: 'red',
                        borderRadius: 999,
                        minWidth: 21,
                        height: 21,
                        justifyContent: 'center',
                        alignItems: 'center',
                        // paddingHorizontal: 5,
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>
                        {totalUnRead > 99 ? '99+' : totalUnRead}
                      </Text>
                    </View>
                  </View>
                );
              }

              return icon;
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
                e.preventDefault();
              },
            })}
          />
          <Tab.Screen name="Chat" component={ChatScreen} />
          <Tab.Screen name="Notification" component={NotificationScreen} />
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
