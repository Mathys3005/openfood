import { SignedIn, SignedOut, useSession, useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { StyleSheet, View, Text, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Meal } from '../../../types/meal.type'
import { router } from 'expo-router'

export default function Page() {
  const [meals, setMeals] = useState<Meal[]>([])

  if (meals.length === 0) {
    return (
      <SafeAreaView style={styles.safeAreaStyle}>
        <View style={styles.containerStyle}>
          <Ionicons name="restaurant-outline" size={80} color="#aeaeae" />
          <Text style={styles.title}>Aucun repas enregistré</Text>
          <Text style={styles.text}>Commencez par ajouter votre premier repas !</Text>
        </View>
        <Pressable onPress={() => router.push('add')} style={styles.addButton}>
          <Ionicons name="add-circle" size={48} color="#4CAF50" />
        </Pressable>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeAreaStyle}>
      <View style={styles.containerStyle}>
        <Text style={styles.title}>Mes repas</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaStyle: {
    flex: 1,
    padding: 10,
  },
  containerStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#aeaeae',
  },
  text: {
    fontSize: 16,
    color: '#aeaeae',
  },

  addButton: {
    marginLeft: "auto",
    marginTop: "auto",
    width: 48,
    height: 48,
  }
})