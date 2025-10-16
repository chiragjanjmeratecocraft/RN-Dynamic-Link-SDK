import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { Deeplink, useSmartLinking } from '@tecocraft/rn-deeplinking';

const App = () => {

  useSmartLinking({
    onUrl: (url) => {
      console.log('URL received:', url);
    },
    onSuccess: (data) => {
      // `data` is a normalized dynamic link response
      console.log('Resolved link:', data);
    },
    onFallback: (fallbackUrl) => {
      console.log('Will open fallback:', fallbackUrl);
    },
    onError: (err) => {
      console.warn('Deep link error:', err.message);
    },
  });

  // useEffect(() => {
  //   const unsubscribe = Deeplink.addListener((url) => {
  //     console.log('Opened via link:', url);
  //     // Handle your deep link logic here
  //   });

  //   return () => unsubscribe();
  // }, []);

  return (
    <View style={styles.container}>
      <Text>Deep Linking Example</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
});

export default App;
