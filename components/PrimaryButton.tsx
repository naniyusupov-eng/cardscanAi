import React from 'react';
import {
    Pressable,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    Platform,
    useColorScheme
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Spacing, Typography } from '../constants/Theme';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    variant?: 'primary' | 'secondary' | 'outline';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    style,
    textStyle,
    variant = 'primary',
}) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return {
                    button: { backgroundColor: theme.secondary },
                    text: { color: theme.secondaryForeground },
                };
            case 'outline':
                return {
                    button: {
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: theme.border
                    },
                    text: { color: theme.foreground },
                };
            default:
                return {
                    button: { backgroundColor: theme.primary },
                    text: { color: theme.primaryForeground },
                };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                styles.button,
                variantStyles.button,
                pressed && styles.pressed,
                (disabled || loading) && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variantStyles.text.color} />
            ) : (
                <Text style={[styles.text, variantStyles.text, textStyle]}>
                    {title}
                </Text>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        ...Typography.button,
    },
});
