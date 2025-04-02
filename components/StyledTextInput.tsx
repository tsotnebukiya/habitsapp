// components/StyledTextInput.tsx
import React, { useState } from 'react';
import { TextInput, View, StyleSheet, ViewStyle, TextStyle, ColorValue } from 'react-native';

interface StyledTextInputProps extends React.ComponentProps<typeof TextInput> {
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  placeholderTextColor?: ColorValue;
  focusColor?: string;
}

const StyledTextInput: React.FC<StyledTextInputProps> = ({
  containerStyle,
  inputStyle,
  placeholderTextColor = '#A0A0A0',
  focusColor = '#007AFF',
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: isFocused ? focusColor : '#E0E0E0',
            color: props.value ? '#000000' : '#808080',
          },
          inputStyle,
          style,
        ]}
        placeholderTextColor={placeholderTextColor}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  input: {
    height: 60,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

export default StyledTextInput;