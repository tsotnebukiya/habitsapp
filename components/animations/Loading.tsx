// components/animations/Loading.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

const Loading = () => {
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    const fadeAnimation = Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      })
    ]);

    Animated.loop(fadeAnimation).start();

    return () => fadeAnimation.stop();
  }, []);

  return (
    <View style={{ 
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <View style={{
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
      }}>
        <Animated.View style={{ opacity: fadeAnim, marginBottom: 16 }}>
          <FontAwesome6 
            name="hourglass-start" 
            size={48} 
            color={Colors.palette.neutral[600]}
          />
        </Animated.View>
        <Text style={{ 
          fontSize: 18,
          color: Colors.palette.neutral[600],
          fontWeight: '500'
        }}>
          Loading data...
        </Text>
      </View>
    </View>
  );
};

export default Loading;