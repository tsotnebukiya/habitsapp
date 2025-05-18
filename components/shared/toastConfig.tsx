import { colors, fontWeights } from '@/lib/constants/ui';
import { ErrorToast } from 'react-native-toast-message';

import { BaseToast } from 'react-native-toast-message';

const toastConfig = {
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: colors.tabBarGrey }}
      text1Style={{
        fontFamily: fontWeights.semibold,
      }}
      text2Style={{
        fontFamily: fontWeights.medium,
      }}
    />
  ),
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: colors.primary }}
      text1Style={{
        fontFamily: fontWeights.semibold,
      }}
      text2Style={{
        fontFamily: fontWeights.medium,
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: colors.habitColors.salmonRed }}
      text1Style={{
        fontFamily: fontWeights.semibold,
      }}
      text2Style={{
        fontFamily: fontWeights.medium,
      }}
    />
  ),
};

export default toastConfig;
