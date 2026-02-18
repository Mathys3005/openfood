import { Tabs } from 'expo-router'
import { Stack } from 'expo-router/stack'

export default function Layout() {
  console.log('je passe dans le layout home')
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  )
}