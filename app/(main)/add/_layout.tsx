import { Stack } from 'expo-router';

export default function AddLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{title: 'Nouveau repas'}}
            />
            <Stack.Screen
                name="camera"
                options={{title: 'Scanner un produit'}}
            />
        </Stack>
    );
}