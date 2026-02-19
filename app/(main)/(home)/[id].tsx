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

  const getNutriColor = (score?: string) => {
    switch ((score || '').toLowerCase()) {
      case 'a':
        return '#2E7D32'
      case 'b':
        return '#66BB6A'
      case 'c':
        return '#FBC02D'
      case 'd':
        return '#FB8C00'
      case 'e':
        return '#E53935'
      default:
        return '#9E9E9E'
    }
  }

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
                resizeMode="contain"
              />
            ) : (
              <View style={styles.foodImagePlaceholder}>
                <Ionicons name="image-outline" size={30} color="#D6E3DD" />
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
              <View style={[styles.nutriBadge, { backgroundColor: getNutriColor(item.nutriscore) }]}>
                <Text style={styles.nutriBadgeText}>Nutriscore {item.nutriscore ? item.nutriscore.toUpperCase() : 'N/A'}</Text>
              </View>
              <Text style={styles.foodBrand}>
                {item.brand ? `Marque : ${item.brand}` : ''}
              </Text>
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
    backgroundColor: '#F3F7F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F7A55',
    marginLeft: 0,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7A78',
    marginLeft: 0,
    marginTop: 4,
  },
  containerStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#1F2D2A',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#1F7A55',
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D6E3DD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7A78',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F7A55',
    marginTop: 4,
  },
  statUnit: {
    fontSize: 10,
    color: '#6B7A78',
    marginTop: 2,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  foodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D6E3DD',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
    overflow: 'hidden',
  },
  foodImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#F8FBFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D6E3DD',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2D2A',
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  nutritionText: {
    color: '#6B7A78',
    fontSize: 12,
  },
  nutritionSeparator: {
    marginHorizontal: 4,
    color: '#D6E3DD',
  },
  nutriBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  nutriBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  foodBrand: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7A78',
    fontWeight: '600',
  },
})

export default DetailMealScreen