import { View, Text, Pressable, TextInput, ScrollView, FlatList, Image, StyleSheet, Alert } from 'react-native'
import { useEffect, useState, useCallback, use } from 'react'
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
    const [scannedFood, setScannedFood] = useState<string | null>(null)

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

    useFocusEffect(
        useCallback(() => {
            const loadScannedFood = async () => {
                const food = await AsyncStorage.getItem("scannedFood")
                setScannedFood(food)
            }
            loadScannedFood()
        }, [])
    )
    

    const addScannedFoodToSelected = async () => {
        if (scannedFood) {
            try {
                const food: Food = JSON.parse(scannedFood)
                if (!selectedFoods.some(f => f.id === food.id)) {
                    setSelectedFoods(prev => [...prev, food])
                    await AsyncStorage.removeItem("scannedFood")
                    setScannedFood(null)
                }
            } catch (error) {
                console.error("Erreur parsing scanned food:", error)
                Alert.alert("Une erreur est survenue avec le produit scanné. Veuillez réessayer.")
            }
        }
    }

    useEffect(() => {
        if (scannedFood) {
            addScannedFoodToSelected()
        }
    }, [scannedFood])

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
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <View style={styles.foodImagePlaceholder}>
                                        <Ionicons name="image-outline" size={30} color="#D6E3DD" />
                                    </View>
                                )}
                                <View style={styles.foodInfo}>
                                    <Text style={styles.foodName}>{item.name}</Text>
                                    <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                                    <View style={[styles.nutriBadge, { backgroundColor: getNutriColor(item.nutriscore) }]}>
                                        <Text style={styles.nutriBadgeText}>Nutriscore {item.nutriscore ? item.nutriscore.toUpperCase() : 'N/A'}</Text>
                                    </View>
                                    <Text style={styles.foodCalories}>{item.brand}</Text>
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
            {debouncedSearchString && (
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
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={styles.foodImagePlaceholder}>
                                    <Ionicons name="image-outline" size={30} color="#D6E3DD" />
                                </View>
                            )}
                            <View style={styles.foodInfo}>
                                <Text style={styles.foodName}>{item.name}</Text>
                                <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                                <View style={[styles.nutriBadge, { backgroundColor: getNutriColor(item.nutriscore) }]}>
                                    <Text style={styles.nutriBadgeText}>Nutriscore {item.nutriscore ? item.nutriscore.toUpperCase() : 'N/A'}</Text>
                                </View>
                                <Text style={styles.foodCalories}>{item.brand}</Text>
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
            )}
        </View>
    )
}

export default AddFoodScreen

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: '#F3F7F5',
        borderBottomWidth: 1,
        borderBottomColor: '#D6E3DD',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F7A55',
        marginBottom: 0,
    },
    flatListScroll: {
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: '#F3F7F5',
    },
    mealTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 8,
    },
    mealTypeButton: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 4,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
        borderColor: '#D6E3DD',
    },
    mealTypeButtonSelected: {
        backgroundColor: '#1F7A55',
        borderColor: '#1F7A55',
    },
    mealTypeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4E625C',
    },
    mealTypeTextSelected: {
        color: '#FFFFFF',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        height: 44,
        gap: 8,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D6E3DD',
        borderRadius: 12,
        paddingHorizontal: 12,
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        marginLeft: 8,
        color: '#1F2D2A',
    },
    cameraButton: {
        padding: 10,
        borderRadius: 12,
        backgroundColor: '#1F7A55',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    flatListContent: {
        paddingBottom: 100,
        paddingTop: 12,
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
    foodCalories: {
        color: '#6B7A78',
        fontSize: 13,
        marginTop: 2,
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
    addButton: {
        padding: 10,
        borderRadius: 100,
        backgroundColor: '#1F7A55',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButton: {
        padding: 10,
        borderRadius: 100,
        backgroundColor: '#E53935',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedFoodsCount: {
        marginTop: 12,
        marginBottom: 8,
        marginLeft: 16,
        fontSize: 14,
        fontWeight: '700',
        color: '#1F7A55',
    },
    validateButton: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#1F7A55',
    },
})