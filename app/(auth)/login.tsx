import { useSignIn } from '@clerk/clerk-expo'
import type { EmailCodeFactor } from '@clerk/types'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

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
      <View style={styles.container}>
        <Text style={styles.title}>
          Vérifiez votre email
        </Text>
        <Text style={styles.description}>
          Un code de vérification a été envoyé à votre email.
        </Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Entrez le code de vérification"
          placeholderTextColor="#666666"
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
          <Text style={styles.buttonText}>{isLoading ? 'Vérification...' : 'Vérifier'}</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Se connecter
      </Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Text style={styles.label}>Adresse email</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Entrez votre email"
        placeholderTextColor="#666666"
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        keyboardType="email-address"
        editable={!isLoading}
      />
      <Text style={styles.label}>Mot de passe</Text>
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Entrez votre mot de passe"
        placeholderTextColor="#666666"
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
        <Text>Pas encore de compte ? </Text>
        <Link href="/sign-up">
          <Text style={styles.linkText}>S'inscrire</Text>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    marginBottom: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  linkContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
})