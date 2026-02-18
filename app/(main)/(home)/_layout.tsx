import { Tabs } from 'expo-router'
import { Stack } from 'expo-router/stack'

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Mes repas' }} />
      <Stack.Screen name="details"/>
    </Stack>
  )
}