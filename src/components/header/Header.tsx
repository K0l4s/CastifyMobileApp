import React from 'react';
import { View, Text, TextInput, Image, StyleSheet } from 'react-native';

const appLogo = require('../../assets/images/logo.png');

const Header = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>CASTIFY</Text>
      <TextInput
        placeholder="Search"
        style={styles.searchInput}
      />
      <Image
        source={appLogo}
        style={styles.profilePic}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  logo: {
    fontWeight: 'bold',
    fontSize: 18,
    flex: 1,
  },
  searchInput: {
    flex: 3,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 8,
    marginHorizontal: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default Header;
