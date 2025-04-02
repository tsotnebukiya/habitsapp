// components/separators/Separator.tsx
import React from "react";
import { View } from "react-native";

export function Separator({ vertMargin = 20}: {vertMargin?: number}) {
    return (
        <View style={{
            marginVertical: vertMargin,
            height: 1,
            width: '100%',
            backgroundColor: '#e0e0e0'
        }} />
    )
}