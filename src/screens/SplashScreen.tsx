import React, {useEffect} from 'react';
import {View, Image, StyleSheet, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';

// Import images
const appLogo = require('../assets/images/logo.png');

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const loadData = async () => {
      // Placeholder function for loading data
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate a 2-second loading time
    };

    loadData().then(() => {
      const timer = setTimeout(() => {
        navigation.navigate('Main' as never);
      }, 3000); // 3 secs

      return () => clearTimeout(timer); // Clear timer when component unmounts
    });
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
