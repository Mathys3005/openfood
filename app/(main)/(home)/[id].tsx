import { View, Text, FlatList, Image, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Meal } from '../../../types/meal.type'
import { Ionicons } from '@expo/vector-icons'

const DetailMealScreen = () => {
  const { id } = useLocalSearchParams()
  const [meal, setMeal] = useState<Meal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMealDetail()
  }, [id])

  const loadMealDetail = async () => {
    try {
      const existingMeals = await AsyncStorage.getItem('meals')
      const mealsData: Meal[] = existingMeals ? JSON.parse(existingMeals) : []
      const foundMeal = mealsData.find((m) => m.id === id)
      setMeal(foundMeal || null)
    } catch (error) {
      console.error('Error loading meal:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.viewStyle}>
        <Text>Chargement...</Text>
      </View>
    )
  }

  if (!meal) {
    return (
      <View style={styles.viewStyle}>
        <View style={styles.containerStyle}>
          <Text style={styles.errorText}>Repas non trouvé</Text>
        </View>
      </View>
    )
  }

  const totalCalories = meal.foods.reduce((sum, food) => sum + food.calories, 0)
  const totalCarbs = meal.foods.reduce((sum, food) => sum + food.carbs, 0)
  const totalProteins = meal.foods.reduce((sum, food) => sum + food.proteins, 0)
  const totalFats = meal.foods.reduce((sum, food) => sum + food.fats, 0)

  return (
    <View style={styles.viewStyle}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{meal.name}</Text>
          <Text style={styles.headerSubtitle}>{meal.date}</Text>
        </View>
      </View>

      <FlatList
        data={meal.foods}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.foodCard}>
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.foodImage}
              />
            ) : (
              <View style={styles.foodImagePlaceholder}>
                <Ionicons name="image-outline" size={30} color="#C0C0C0" />
              </View>
            )}
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{item.name}</Text>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionText}>
                  {Math.round(item.calories)} kcal
                </Text>
                <Text style={styles.nutritionSeparator}>•</Text>
                <Text style={styles.nutritionText}>
                  P: {Math.round(item.proteins)}g
                </Text>
                <Text style={styles.nutritionSeparator}>•</Text>
                <Text style={styles.nutritionText}>
                  C: {Math.round(item.carbs)}g
                </Text>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.flatListContent}
        ListHeaderComponent={
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Calories</Text>
              <Text style={styles.statValue}>{Math.round(totalCalories)}</Text>
              <Text style={styles.statUnit}>kcal</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Protéines</Text>
              <Text style={styles.statValue}>{Math.round(totalProteins)}</Text>
              <Text style={styles.statUnit}>g</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Glucides</Text>
              <Text style={styles.statValue}>{Math.round(totalCarbs)}</Text>
              <Text style={styles.statUnit}>g</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Lipides</Text>
              <Text style={styles.statValue}>{Math.round(totalFats)}</Text>
              <Text style={styles.statUnit}>g</Text>
            </View>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8C8C8C',
    marginLeft: 12,
  },
  containerStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#2E2E2E',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F5F6F7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statLabel: {
    fontSize: 12,
    color: '#8C8C8C',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  statUnit: {
    fontSize: 10,
    color: '#8C8C8C',
    marginTop: 2,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  foodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  foodImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2E2E',
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  nutritionText: {
    color: '#8C8C8C',
    fontSize: 12,
  },
  nutritionSeparator: {
    marginHorizontal: 4,
    color: '#E0E0E0',
  },
})

export default DetailMealScreen