
import React from 'react';
import { registerRootComponent } from 'expo';
import { View, StyleSheet, StatusBar } from 'react-native';
import App from './App';

const Root = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <App />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});

registerRootComponent(Root);
