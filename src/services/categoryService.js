import { apiClient } from './apiClient'

export const categoryService = {
  async getCategories() {
    const { data } = await apiClient.get('/categories')
    return data
  },
}
