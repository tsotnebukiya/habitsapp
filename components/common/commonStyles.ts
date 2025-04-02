// components/common/commonStyles.ts
import { StyleSheet } from 'react-native';
import { marginSpacing } from '../../app/_layout';

export const commonStyles = StyleSheet.create({
    pageTitleText: {
        fontSize: 32, fontWeight: '600',
        paddingLeft: marginSpacing,
    },
    pageTitleTextNoSpacing: {
        fontSize: 32, fontWeight: '600',
    },

    sectionTitle: {
        fontSize: 25,
        fontWeight: '500',
        textAlign: 'left',
        marginBottom: 12,
    },
    sectionTitleSmall: {
        fontSize: 20,
        fontWeight: '500',
        marginBottom: 12,
    },
    sectionTitleBottomSpacer: {
        marginBottom: 12,
    },
    nicerPageTitleText: {
        fontSize: 32,
        fontWeight: '600',
        paddingLeft: marginSpacing,
        color: 'black', // Changed from black to match our color scheme
        // textAlign: 'center',
        marginBottom: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    }
});

export const sectionSpacer = 32;
export const betweenSectionItemsSpacer = 12;