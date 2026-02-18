import { SignedIn, SignedOut, useSession, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { StyleSheet, Text } from 'react-native'
import { View } from 'react-native'
import { SignOutButton } from '../../../components/sign-out-button'

export default function Page() {
  const { user } = useUser()

  const { session } = useSession()
  console.log(session?.currentTask)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      {/* Show the sign-in and sign-up buttons when the user is signed out */}
      <SignedOut>
        <Link href="/(auth)/sign-in">
          <Text style={styles.linkText}>Sign in</Text>
        </Link>
        <Link href="/(auth)/sign-up">
          <Text style={styles.linkText}>Sign up</Text>
        </Link>
      </SignedOut>
      {/* Show the sign-out button when the user is signed in */}
      <SignedIn>
        <Text style={styles.userText}>Hello {user?.emailAddresses[0].emailAddress}</Text>
        <SignOutButton />
      </SignedIn>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  linkText: {
    fontSize: 16,
    color: '#0a7ea4',
  },
  userText: {
    fontSize: 16,
  },
})