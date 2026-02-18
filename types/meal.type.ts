import { Food } from './food.type'

export type Meal = {
  id: string
  name: string
  date: string
  foods: Food[]
}