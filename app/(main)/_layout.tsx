import { useAuth } from '@clerk/clerk-expo'
import { Redirect, Stack, Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function MainLayout() {
	const { isSignedIn } = useAuth()
	if (!isSignedIn) {
		return <Redirect href={'/(auth)/signup'} />
	}

	return (
	<Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#4CAF50', tabBarInactiveTintColor: '#8E8E93' }}>
		<Tabs.Screen name="(home)" options={{ title: 'Repas', tabBarIcon: ({ focused }) => 
			<Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} size={24} 
			color={focused ? '#4CAF50' : '#8E8E93'}/> }} />
		<Tabs.Screen name="add" options={{ title: 'Ajouter', tabBarIcon: ({ focused }) =>
			<Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={24} color={focused ? '#4CAF50' : '#8E8E93'} /> }} />
		<Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ focused }) =>
			<Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={focused ? '#4CAF50' : '#8E8E93'} /> }} />
	</Tabs>
	)
}
