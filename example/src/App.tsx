import { View, Text } from 'react-native';
import React from 'react';
import { useSmartLinking } from '@tecocraft/rn-deeplinking';

const App = () => {

  const { } = useSmartLinking();

  return (
    <View>
      <Text>App</Text>
    </View>
  )
}

export default App