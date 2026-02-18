import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  console.log('je passe dans le layout root')
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(main)/(home)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      <StatusBar style="auto" />
    </ClerkProvider>
  )
}