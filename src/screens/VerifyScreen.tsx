import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { RouteProp } from '@react-navigation/native';
import AuthenticateService from '../services/authenticateService';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../type/navigationType';

type RouteParams = {
  Verify: {
    token: string;
  };
};

const VerifyScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'Verify'>>();
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();
  const { token } = route.params;

  useEffect(() => {
    if (token) {
      const response = AuthenticateService.verifyAccount(token);
      response.then(res => {
        const { access_token, refresh_token } = res.data;

          // Lưu token vào Keychain
          Keychain.setGenericPassword(
            'tokenData',
            JSON.stringify({ access_token, refresh_token }),
          );

          // Điều hướng đến VerifySuccessScreen
          navigation.replace('VerifySuccess');
      });
    }
  }, [token]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text style={styles.title}>Email Verification</Text>
          <Text style={styles.message}>
            Please check your email and verify your account.
          </Text>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
});

export default VerifyScreen;
