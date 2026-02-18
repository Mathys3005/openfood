import { View, Text, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native'
import { useState } from 'react'
import { mealTypes } from '../../../types/mealType.type'

const AddFoodScreen = () => {
    const [selectedMealType, setSelectedMealType] = useState<string>('')
    console.log('Selected meal type:', selectedMealType)
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
                        isSelected && styles.mealTypeButtonSelected,
                    ]}
                    >
                    <Text
                        style={[
                        styles.mealTypeText,
                        isSelected && styles.mealTypeTextSelected,
                        ]}
                    >
                        {mealType.name}
                    </Text>
                    </Pressable>
                )
                })}
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
    marginBottom: 20,
    gap: 8,
    flex: 1,
  },
  mealTypeButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    backgroundColor: '#F5F6F7',
    borderColor: '#E0E0E0',
  },
  mealTypeButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  mealTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2E2E',
  },
  mealTypeTextSelected: {
    color: '#FFFFFF',
  },

})