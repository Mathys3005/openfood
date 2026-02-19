import { View, Text, Pressable, TextInput, ScrollView, FlatList, Image } from 'react-native'
import { StyleSheet } from 'react-native'
import { useEffect, useState } from 'react'
import { mealTypes } from '../../../types/mealType.type'
import { Ionicons } from '@expo/vector-icons'
import { Food } from '../../../types/food.type'
import useDebounce from '../../../tools/debounce'

const AddFoodScreen = () => {
    const [selectedMealType, setSelectedMealType] = useState<string>('')
    const [searchString, setSearchString] = useState<string>('')
    const [foods, setFoods] = useState<Food[]>([])
    const [selectedFoods, setSelectedFoods] = useState<Food[]>([])
    const debouncedSearchString = useDebounce(searchString, 1200)

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
                  calories: product.nutriments['energy-kcal_100g'] || 0,
                  carbohydrates: product.nutriments['carbohydrates_100g'] || 0,
                  proteins: product.nutriments['proteins_100g'] || 0,
                  fats: product.nutriments['fat_100g'] || 0,
                  image_url: product.image_url || '',
                }))
              setFoods(products)
            })
            .catch((error) => {
                alert('Une erreur est survenue lors de la recherche de produits. Veuillez réessayer plus tard.')
                console.error('Error fetching products:', error)
            })
    }, [debouncedSearchString])

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={styles.title}>Type de repas</Text>
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
            <View style={styles.foodListContainer}>
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
                    <Pressable onPress={() => setSearchString('')} style={styles.cameraButton}>
                        <Ionicons name="scan" size={20} color="white" />
                    </Pressable>
                </View>
                {selectedFoods.length > 0 && foods.length === 0 && (
                    <>
                        <Text style={styles.selectedFoodsCount}>{selectedFoods.length} aliment(s) sélectionné(s)</Text>
                        <FlatList
                            style={{ marginTop: 20, marginBottom: 20 }}
                            data={selectedFoods}
                            keyExtractor={(item) => item.id}
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
                                        <Text style={styles.foodCalories}>
                                            {Math.round(item.calories)} kcal
                                        </Text>
                                    </View>
                                    <Pressable style={styles.removeButton} onPress={() => {
                                        setSelectedFoods(selectedFoods.filter(food => food.id !== item.id))
                                    }}>
                                        <Ionicons name="remove" size={24} color="white" />
                                    </Pressable>
                                </View>
                            )}
                        />
                    </>
                )}
                <FlatList
                    style={{ marginTop: 20, paddingBottom: 100 }}
                    data={foods}
                    keyExtractor={(item) => item.id}
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
                                <Text style={styles.foodCalories}>
                                    {Math.round(item.calories)} kcal
                                </Text>
                            </View>
                            <Pressable style={selectedFoods.some(food => food.id === item.id) ? styles.removeButton : styles.addButton} onPress={() => {
                                if (!selectedFoods.some(food => food.id === item.id)) {
                                    setSelectedFoods([...selectedFoods, item])
                                } else {
                                    setSelectedFoods(selectedFoods.filter(food => food.id !== item.id))
                                }
                                
                            }}>
                            {selectedFoods.some(food => food.id === item.id) ? (
                                <Ionicons name="remove" size={24} color="white" />
                            ) : (
                                <Ionicons name="add" size={24} color="white" />
                            )}
                            </Pressable>
                        </View>
                    )}
                />
                
            </View>
        </View>
    )
}

export default AddFoodScreen

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
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
    height: 40,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    width: '90%',
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
    width: '10%',
  },
    foodListContainer: {
        marginTop: 20,
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
    },
    removeButton: {
        padding: 8,
        borderRadius: 100,
        backgroundColor: '#FF6B6B',
    },
    selectedFoodsCount: {
        marginTop: 10,
        fontSize: 14,
        color: '#4CAF50',
    },

})
