import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FollowingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Following Screen</Text>
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
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default FollowingScreen;
