export type MealType = {
    id: string
    name: string
}

export const mealTypes: MealType[] = [
    { id: 'breakfast', name: 'Petit-déjeuner' },
    { id: 'lunch', name: 'Déjeuner' },
    { id: 'dinner', name: 'Dîner' },
    { id: 'snack', name: 'Snack' },
]