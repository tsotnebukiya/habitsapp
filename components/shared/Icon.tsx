import { IconType } from '@/lib/constants/icons';
import { colors } from '@/lib/constants/ui';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Text } from 'react-native';

export const getIconTint = (hex: string) => {
  const [r, g, b] = hex.match(/\w\w/g)!.map((v) => parseInt(v, 16));
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq > 150 ? colors.text : '#FFFFFF';
};

export const isEmoji = (icon: IconType): icon is IconType =>
  /\p{Extended_Pictographic}/u.test(icon);

type ItemIconProps = {
  icon: IconType;
  color: string;
};

const ItemIcon = ({ icon, color }: ItemIconProps) => {
  if (isEmoji(icon)) {
    return <Text style={{ fontSize: 24, color }}>{icon}</Text>;
  }
  return <SymbolView name={icon} size={24} tintColor={color} />;
};

export default ItemIcon;
