import { IconType } from '@/lib/constants/icons';
import { MaterialIcons } from '@expo/vector-icons';
import emojiRegex from 'emoji-regex';
import React from 'react';
import { Text } from 'react-native';

const pattern = emojiRegex();

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

  return <MaterialIcons name={icon} size={24} color={color} />;
};

export default ItemIcon;
