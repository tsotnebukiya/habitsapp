// components/separators/HalfSeparatorWithText.tsx
import React from "react";
import { Dimensions, TouchableOpacity, View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function HalfSeparatorWithText({ text, show, toggle }: { text: string, show: Function, toggle: boolean; }) {
    return (
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 15, marginLeft: Dimensions.get('window').width * 0.05 * -1 }}
            onPress={() => show(!toggle)}>
            <View style={{
                // marginVertical: 20,
                height: 1,
                width: '25%',
                backgroundColor: "#eee"
            }} />
            <Text style={{ fontSize: 18, color: 'gray', fontWeight: '600', marginHorizontal: 5 }}>{text} <FontAwesome name={toggle ? "angle-up" : "angle-down"} size={18} color="gray" /></Text>
            <View style={{
                // marginVertical: 20,
                height: 1,
                width: '25%',
                backgroundColor: "#eee"
            }} />
        </TouchableOpacity>
    );
}