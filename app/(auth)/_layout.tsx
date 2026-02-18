import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()
  console.log('je passe dans le layout auth')
  if (isSignedIn) {
    return <Redirect href={'/'} />
  }

  return <Stack />
}