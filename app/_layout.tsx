import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <SafeAreaProvider style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#09090b' : '#ffffff' }}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} translucent={true} />
            <View style={{ flex: 1 }}>
                <Slot />
            </View>
        </SafeAreaProvider>
    );
}
