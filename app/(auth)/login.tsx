import { useSignIn } from '@clerk/clerk-expo'
import type { EmailCodeFactor } from '@clerk/types'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [showEmailCode, setShowEmailCode] = React.useState(false)
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const getErrorMessage = (err: any): string => {
    if (err?.errors?.[0]?.message) {
      return err.errors[0].message
    }
    if (err?.message) {
      return err.message
    }
    return 'Une erreur est survenue. Veuillez réessayer.'
  }

  // Handle the submission of the sign-in form
  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return

    setError('')
    setIsLoading(true)

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              return
            }
            router.replace('/')
          },
        })
      } else if (signInAttempt.status === 'needs_second_factor') {
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor => factor.strategy === 'email_code',
        )

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          })
          setShowEmailCode(true)
        }
      } else {
        setError('Erreur de connexion. Veuillez réessayer.')
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setIsLoading(false)
    }
  }, [isLoaded, signIn, setActive, router, emailAddress, password])

  // Handle the submission of the email verification code
  const onVerifyPress = React.useCallback(async () => {
    if (!isLoaded) return

    setError('')
    setIsLoading(true)

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              return
            }
            router.replace('/')
          },
        })
      } else {
        setError('Code de vérification invalide. Veuillez réessayer.')
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setIsLoading(false)
    }
  }, [isLoaded, signIn, setActive, router, code])

  // Display email code verification form
  if (showEmailCode) {
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
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TextInput
            style={styles.input}
            value={code}
            placeholder="Entrez le code"
            placeholderTextColor="#6B7A78"
            onChangeText={(code) => setCode(code)}
            keyboardType="numeric"
            editable={!isLoading}
          />
          <Pressable
            style={({ pressed }) => [
              styles.button,
              (!code || isLoading) && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={onVerifyPress}
            disabled={!code || isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'Verification...' : 'Verifier'}</Text>
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
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>Retrouvez vos repas et vos objectifs.</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <Text style={styles.label}>Adresse email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Entrez votre email"
          placeholderTextColor="#6B7A78"
          onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
          keyboardType="email-address"
          editable={!isLoading}
        />
        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          value={password}
          placeholder="Entrez votre mot de passe"
          placeholderTextColor="#6B7A78"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
          editable={!isLoading}
        />
        <Pressable
          style={({ pressed }) => [
            styles.button,
            (!emailAddress || !password || isLoading) && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={onSignInPress}
          disabled={!emailAddress || !password || isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Connexion...' : 'Se connecter'}</Text>
        </Pressable>
        <View style={styles.linkContainer}>
          <Text style={styles.linkTextMuted}>Pas encore de compte ? </Text>
          <Link href="/sign-up">
            <Text style={styles.linkText}>S'inscrire</Text>
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
  errorText: {
    color: '#B42318',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: '#FEE4E2',
    padding: 10,
    borderRadius: 10,
    overflow: 'hidden',
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