import { useAuth } from '@clerk/clerk-expo'
import { Redirect, Stack } from 'expo-router'

export default function MainLayout() {
	const { isSignedIn } = useAuth()
    console.log('je passe dans le layout main')
	if (!isSignedIn) {
		return <Redirect href={'/(auth)/signup'} />
	}

	return <Stack screenOptions={{ headerShown: false }} />
}
