import React, {useEffect} from 'react';
import {View, Image, StyleSheet, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../type/navigationType';
import * as Keychain from 'react-native-keychain';
import { useDispatch } from 'react-redux';
import { login, setUser } from '../redux/reducer/authSlice';
import AuthenticateService from '../services/authenticateService';
import UserService from '../services/userService';

// Import images
const appLogo = require('../assets/images/logo.png');

const SplashScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();
  const dispatch = useDispatch();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if access_token is still valid ?
        const valid = await AuthenticateService.IsTokenValid();

        // If valid, dispatch login action
        if (valid) {
          dispatch(login());
          let data = await UserService.getUserByToken();

          const fullData = await UserService.getUserByUsername(data.username, true);
          const { firstName, middleName, lastName } = splitFullName(fullData.fullname);

           dispatch(setUser({ ...fullData, firstName, middleName, lastName }));
        } else {
          // If expired, call refresh token api
          const response = await AuthenticateService.refreshToken();

          if (response) {
            dispatch(login());
            let data = await UserService.getUserByToken();

            const fullData = await UserService.getUserByUsername(data.username, true);
            dispatch(setUser(fullData));
          }
        }
      } catch (error) {
        console.error('Error during authentication:', error);
      }
    };

    const timeoutId = setTimeout(() => {
      navigation.replace('Main');
    }, 20000); // 20 secs

    loadData().then(() => {
      clearTimeout(timeoutId);
      navigation.replace('Main');
    });

    return () => clearTimeout(timeoutId); // Clear timeout when component unmounts
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={appLogo}
        style={styles.image}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIcon}/>
    </View>
  );
};

const splitFullName = (fullname: string) => {
  const parts = fullname.trim().split(' ');
  const lastName = parts[0] || '';
  const firstName = parts.length > 1 ? parts[parts.length - 1] : '';
  const middleName = parts.slice(1, parts.length - 1).join(' ') || '';
  return { firstName, middleName, lastName };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 150,
    height: 150,
  },
  loadingIcon: {
    marginTop: 20,
  }
});

export default SplashScreen;
