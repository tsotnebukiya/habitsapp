// components/separators/HalfSeparator.tsx
import React from "react";
import { View, Dimensions } from "react-native";

export default function HalfSeparator({vertMargin = 20}: {vertMargin?: number}) {
    return (
        <View style={{
            marginVertical: vertMargin,
            height: 1,
            width: '50%',
            marginLeft: Dimensions.get('window').width * 0.25,
            backgroundColor: '#e0e0e0'
        }} />
    )
}