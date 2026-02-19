import { View, Text, Pressable, TextInput, ScrollView, FlatList, Image, StyleSheet, Alert } from 'react-native'
import { useEffect, useState, useCallback } from 'react'
import { mealTypes } from '../../../types/mealType.type'
import { Ionicons } from '@expo/vector-icons'
import { Food } from '../../../types/food.type'
import { Meal } from '../../../types/meal.type'
import useDebounce from '../../../tools/debounce'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'

const AddFoodScreen = () => {
    const [selectedMealType, setSelectedMealType] = useState<string>('')
    const [searchString, setSearchString] = useState<string>('')
    const [foods, setFoods] = useState<Food[]>([])
    const [selectedFoods, setSelectedFoods] = useState<Food[]>([])
    const debouncedSearchString = useDebounce(searchString, 1200)
    const { scannedFood } = useLocalSearchParams()

    useFocusEffect(
        useCallback(() => {
            addScannedFoodToSelected()
        }, [scannedFood])
    )

    const addScannedFoodToSelected = async () => {
        try {
            if (scannedFood) {
                const food: Food = JSON.parse(scannedFood as string)
                console.log('Scanned food:', food)
                if (!selectedFoods.some(f => f.id === food.id)) {
                    setSelectedFoods([...selectedFoods, food])
                    setSearchString('')
                }
            }
        } catch (error) {
            console.error('Error adding scanned food:', error)
        }
    }

    const validateMeal = (foods: Food[]) => async () => {
        if (selectedMealType === '') {
            Alert.alert('Veuillez sélectionner un type de repas.')
            return
        }

        try {
            const mealTypeName = mealTypes.find(m => m.id === selectedMealType)?.name || 'Repas'
            
            const newMeal: Meal = {
                id: Date.now().toString(),
                name: mealTypeName,
                date: new Date().toISOString().split('T')[0],
                foods: foods
            }

            const existingMeals = await AsyncStorage.getItem('meals')
            const meals: Meal[] = existingMeals ? JSON.parse(existingMeals) : []

            meals.push(newMeal)

            await AsyncStorage.setItem('meals', JSON.stringify(meals))

            Alert.alert(`Repas ajouté avec ${foods.length} aliment(s)`)
            setSelectedFoods([])
            setSearchString('')
            setSelectedMealType('')
        } catch (error) {
            Alert.alert('Erreur lors de la sauvegarde du repas')
            console.error('Error saving meal:', error)
        }
    }

    useEffect(() => {
        let url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(debouncedSearchString)}&search_simple=1&action=process&json=1`
        
        if (!debouncedSearchString) {
            setFoods([])
            return
        }

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
              const products: Food[] = (data.products || [])
                .filter((product: any) => !!product.nutriments && !!product.product_name)
                .map((product: any) => ({
                  id: product.id,
                  name: product.product_name,
                  brand: product.brands || '',
                  nutriscore: product.nutriscore_grade || '',
                  calories: product.nutriments['energy-kcal_100g'] || 0,
                  carbs: product.nutriments['carbohydrates_100g'] || 0,
                  proteins: product.nutriments['proteins_100g'] || 0,
                  fats: product.nutriments['fat_100g'] || 0,
                  image_url: product.image_url || '',
                }))
              setFoods(products)
            })
            .catch((error) => {
                Alert.alert('Une erreur est survenue lors de la recherche de produits. Veuillez réessayer plus tard.')
                console.error('Error fetching products:', error)
            })
    }, [debouncedSearchString])

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Type de repas</Text>
                    {selectedFoods.length > 0 && (
                    <Pressable style={styles.validateButton} onPress={validateMeal(selectedFoods)}>
                        <Text style={{ color: 'white', fontWeight: '600' }}>Valider</Text>
                        </Pressable>
                    )}
                </View>
                <View style={styles.mealTypeContainer}>
                    {mealTypes.map((mealType) => {
                    const isSelected = selectedMealType === mealType.id
                    return (
                        <Pressable
                            key={mealType.id}
                        onPress={() => setSelectedMealType(mealType.id)}
                            style={[
                                styles.mealTypeButton,
                            isSelected ? styles.mealTypeButtonSelected : null,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.mealTypeText,
                            isSelected ? styles.mealTypeTextSelected : null,
                                ]}
                            >
                                {mealType.name}
                            </Text>
                        </Pressable>
                    )
                    })}
                </View>
                <Text style={styles.title}>Rechercher un aliment</Text>
                <View style={styles.searchContainer}>
                    <View style={styles.searchRow}>
                        <Ionicons name="search" size={20} color="#8C8C8C" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher un produit..."
                            value={searchString}
                            onChangeText={setSearchString}
                        />
                    </View>
                    <Pressable onPress={() => router.push('/add/camera')} style={styles.cameraButton}>
                        <Ionicons name="scan" size={20} color="white" />
                    </Pressable>
                </View>
            </View>

            {selectedFoods.length > 0 && foods.length === 0 && (
                <>
                    <Text style={styles.selectedFoodsCount}>{selectedFoods.length} aliment(s) sélectionné(s)</Text>
                    <FlatList
                        contentContainerStyle={styles.flatListContent}
                        style={styles.flatListScroll}
                        data={selectedFoods}
                        keyExtractor={(item, index) => `selected-${item.id}-${index}`}
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
                                    <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                                </View>
                                <Pressable style={styles.removeButton} onPress={() => {
                                    setSelectedFoods(selectedFoods.filter(food => food.id !== item.id))
                                }}>
                                    <Ionicons name="remove" size={20} color="white" />
                                </Pressable>
                            </View>
                        )}
                    />
                </>
            )}

            <FlatList
                style={styles.flatListScroll}
                data={foods}
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
                            <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                        </View>
                        <Pressable 
                            style={selectedFoods.some(food => food.id === item.id) ? styles.removeButton : styles.addButton} 
                            onPress={() => {
                                if (selectedFoods.some(food => food.id === item.id)) {
                                    setSelectedFoods(selectedFoods.filter(food => food.id !== item.id))
                                } else {
                                    setSelectedFoods([...selectedFoods, item])
                                }
                            }}
                        >
                            <Ionicons name={selectedFoods.some(food => food.id === item.id) ? "remove" : "add"} size={20} color="white" />
                        </Pressable>
                    </View>
                )}
                contentContainerStyle={styles.flatListContent}
            />
        </View>
    )
}

export default AddFoodScreen

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 10,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 0,
    },
    flatListScroll: {
        flex: 1,
        paddingHorizontal: 16,
    },
    mealTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10,
        gap: 4,
    },
    mealTypeButton: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 5,
        borderWidth: 1,
        backgroundColor: '#F5F6F7',
        borderColor: '#E0E0E0',
    },
    mealTypeButtonSelected: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    mealTypeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2E2E2E',
    },
    mealTypeTextSelected: {
        color: '#FFFFFF',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        height: 40,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        flex: 1,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        marginLeft: 8,
    },
    cameraButton: {
        marginLeft: 8,
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4CAF50',
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flatListContent: {
        paddingBottom: 100,
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
    },
    foodCalories: {
        color: '#8C8C8C',
    },
    addButton: {
        padding: 8,
        borderRadius: 100,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButton: {
        padding: 8,
        borderRadius: 100,
        backgroundColor: '#FF6B6B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedFoodsCount: {
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 12,
        fontSize: 14,
        fontWeight: '600',
        color: '#4CAF50',
    },
    validateButton: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#4CAF50',
    },
})