import { SignedIn, SignedOut, useSession, useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect, useCallback } from 'react'
import { StyleSheet, View, Text, Pressable, FlatList, Image, Alert, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Meal } from '../../../types/meal.type'
import { router, useFocusEffect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function Page() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [dailyTargetKcal, setDailyTargetKcal] = useState<number>(2000)

  const toYmd = (dateLike: string | Date) => {
    const d = new Date(dateLike)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('fr-CA')
  }

  const getMealCalories = (meal: Meal) =>
    meal.foods.reduce((sum, food: any) => sum + (food.calories ?? 0), 0)

  const loadDailyTarget = async () => {
    try {
      const stored = await AsyncStorage.getItem('dailyTargetKcal')
      if (stored) setDailyTargetKcal(Number(stored))
    } catch (e) {
      console.error('Error loading daily target:', e)
    }
  }

  const saveDailyTarget = async (value: number) => {
    try {
      await AsyncStorage.setItem('dailyTargetKcal', String(value))
      setDailyTargetKcal(value)
    } catch (e) {
      console.error('Error saving daily target:', e)
    }
  }

  const promptDailyTarget = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Objectif kcal',
        'Entrez votre objectif journalier en kcal',
        (text) => {
          const v = Number(text)
          if (!isNaN(v) && v > 0) saveDailyTarget(v)
        },
        'plain-text',
        String(dailyTargetKcal)
      )
    } else {
      Alert.alert(
        'Objectif kcal',
        'Fonction disponible sur iOS. Dis-moi si tu veux un modal Android.'
      )
    }
  }

  const loadMeals = async () => {
    try {
      const existingMeals = await AsyncStorage.getItem('meals')
      const mealsData: Meal[] = existingMeals ? JSON.parse(existingMeals) : []
      const sortedMeals = mealsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setMeals(sortedMeals)
    } catch (error) {
      console.error('Error loading meals:', error)
    }
  }

  const deleteMeal = async (mealId: string) => {
    try {
      const existingMeals = await AsyncStorage.getItem('meals')
      const mealsData: Meal[] = existingMeals ? JSON.parse(existingMeals) : []
      const updatedMeals = mealsData.filter(meal => meal.id !== mealId)
      await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals))
      setMeals(updatedMeals)
    } catch (error) {
      console.error('Error deleting meal:', error)
      alert('Erreur lors de la suppression du repas')
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadMeals()
      loadDailyTarget()
    }, [])
  )

  const todayKey = toYmd(new Date())
  const todayKcal = meals
    .filter(m => toYmd(m.date) === todayKey)
    .reduce((sum, m) => sum + getMealCalories(m), 0)

  const progress = dailyTargetKcal > 0
    ? Math.min(todayKcal / dailyTargetKcal, 1)
    : 0

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
    <View style={styles.safeAreaStyle}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes repas</Text>
      </View>
      <Pressable style={styles.goalCard} onPress={promptDailyTarget}>
        <View style={styles.goalEditButton}>
          <Ionicons name="pencil" size={24} color="#4CAF50" />
        </View>
        <Text style={styles.goalTitle}>Objectif du jour</Text>
        <Text style={styles.goalValue}>{todayKcal} / {dailyTargetKcal} kcal</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </Pressable>
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={styles.mealCard}
          >
            <View style={styles.mealCardContent}>
              <View>
                <Text style={styles.mealName}>{item.name}</Text>
                <Text style={styles.mealDate}>{item.date}</Text>
                <Text style={styles.mealFoodsCount}>{item.foods.length} aliment(s)</Text>
              </View>
              <View style={styles.mealCardActions}>
                <Pressable
                  onPress={() => router.push(`../(home)/${item.id}`)}
                  style={styles.mealCardActionButton}
                >
                  <Ionicons name="chevron-forward" size={24} color="#4CAF50" />
                </Pressable>
                <Pressable
                  onPress={() => deleteMeal(item.id)}
                  style={styles.mealCardDeleteButton}
                >
                  <Ionicons name="remove" size={24} color="white"/>
                </Pressable>
              </View>
            </View>
            <View style={styles.foodsPreview}>
              {item.foods.slice(0, 3).map((food) => (
                <View key={food.id} style={styles.foodPreviewItem}>
                  {food.image_url ? (
                    <Image
                      source={{ uri: food.image_url }}
                      style={styles.foodPreviewImage}
                      resizeMode="containe"
                    />
                  ) : (
                    <View style={styles.foodPreviewPlaceholder}>
                      <Ionicons name="image-outline" size={16} color="#D6E3DD" />
                    </View>
                  )}
                </View>
              ))}
              {item.foods.length > 3 && (
                <View style={styles.foodPreviewMore}>
                  <Text style={styles.foodPreviewMoreText}>+{item.foods.length - 3}</Text>
                </View>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={styles.flatListContent}
      />
      <Pressable onPress={() => router.push('add')} style={styles.addButton}>
        <Ionicons name="add-circle" size={48} color="#4CAF50" />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  safeAreaStyle: {
    flex: 1,
    backgroundColor: '#F3F7F5',
    padding: 16,
  },
  containerStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F7A55',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4E625C',
  },
  text: {
    fontSize: 14,
    color: '#6B7A78',
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1F7A55',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D6E3DD',
    marginBottom: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  goalEditButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E3E39',
    marginBottom: 8,
  },
  goalValue: {
    fontSize: 16,
    color: '#1F7A55',
    fontWeight: '700',
    marginBottom: 12,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E2ECE7',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#1F7A55',
  },
  flatListContent: {
    paddingBottom: 100,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D6E3DD',
    marginBottom: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  mealCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealCardActionButton: {
    padding: 8,
  },
  mealCardDeleteButton: {
    padding: 8,
    borderRadius: 100,
    backgroundColor: '#E53935',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2D2A',
  },
  mealDate: {
    fontSize: 12,
    color: '#6B7A78',
    marginTop: 4,
  },
  mealFoodsCount: {
    fontSize: 12,
    color: '#1F7A55',
    fontWeight: '600',
    marginTop: 4,
  },
  foodsPreview: {
    flexDirection: 'row',
    gap: 8,
  },
  foodPreviewItem: {
    width: 50,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D6E3DD',
    backgroundColor: '#F8FBFA',
  },
  foodPreviewImage: {
    width: '100%',
    height: '100%',
  },
  foodPreviewPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FBFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodPreviewMore: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#1F7A55',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F7A55',
  },
  foodPreviewMoreText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
})