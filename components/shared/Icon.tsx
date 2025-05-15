import {
  msBed,
  msPill,
  msWaterDropFill,
} from '@material-symbols-react-native/outlined-400';
import React from 'react';
import { Text } from 'react-native';
export const iconMap = {
  msWaterDropFill,
  msPill,
  msBed,
};

type AppIconName = keyof typeof iconMap;

const isEmoji = (icon: string) => {
  return icon.length <= 2 && /\p{Emoji}/u.test(icon);
};

const ItemIcon = ({
  icon,
  color,
}: {
  icon: AppIconName | string;
  color: string;
}) => {
  if (isEmoji(icon)) {
    return <Text style={{ fontSize: 24, color }}>{icon}</Text>;
  }
  const iconData = iconMap[icon as AppIconName];
  return null;
};

export default ItemIcon;
