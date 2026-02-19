import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // Check for tasks and navigate to custom UI to help users resolve them
              // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
              return
            }

            router.replace('/')
          },
        })
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.orbOne} />
        <View style={styles.orbTwo} />
        <View style={styles.card}>
          <Text style={styles.appName}>OpenFood</Text>
          <Text style={styles.title}>Verification email</Text>
          <Text style={styles.description}>
            Un code de verification a ete envoye a votre email.
          </Text>
          <TextInput
            style={styles.input}
            value={code}
            placeholder="Entrez le code"
            placeholderTextColor="#6B7A78"
            onChangeText={(code) => setCode(code)}
            keyboardType="numeric"
          />
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={onVerifyPress}
          >
            <Text style={styles.buttonText}>Verifier</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.orbOne} />
      <View style={styles.orbTwo} />
      <View style={styles.card}>
        <Text style={styles.appName}>OpenFood</Text>
        <Text style={styles.title}>Inscription</Text>
        <Text style={styles.subtitle}>Creez votre compte pour suivre vos repas.</Text>
        <Text style={styles.label}>Adresse email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Entrez votre email"
          placeholderTextColor="#6B7A78"
          onChangeText={(email) => setEmailAddress(email)}
          keyboardType="email-address"
        />
        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          value={password}
          placeholder="Entrez un mot de passe"
          placeholderTextColor="#6B7A78"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
        <Pressable
          style={({ pressed }) => [
            styles.button,
            (!emailAddress || !password) && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={onSignUpPress}
          disabled={!emailAddress || !password}
        >
          <Text style={styles.buttonText}>Continuer</Text>
        </Pressable>
        <View style={styles.linkContainer}>
          <Text style={styles.linkTextMuted}>Deja un compte ? </Text>
          <Link href="/login">
            <Text style={styles.linkText}>Se connecter</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F7F5',
    padding: 20,
    justifyContent: 'center',
  },
  orbOne: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: '#DFF4E8',
    top: -60,
    right: -80,
  },
  orbTwo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: '#EAF7F1',
    bottom: -40,
    left: -40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2ECE7',
    gap: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F7A55',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2D2A',
  },
  subtitle: {
    fontSize: 14,
    color: '#4E625C',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#4E625C',
  },
  label: {
    fontWeight: '600',
    fontSize: 13,
    color: '#2E3E39',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D6E3DD',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8FBFA',
    color: '#1F2D2A',
  },
  button: {
    backgroundColor: '#1F7A55',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  linkContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
    alignItems: 'center',
  },
  linkTextMuted: {
    color: '#4E625C',
  },
  linkText: {
    color: '#1F7A55',
    fontWeight: '700',
  },
})