import { NextRequest, NextResponse } from 'next/server'
import { CategoryModel, FoodItemModel } from '@/models/Food'

export class FoodController {
  // Category Controllers
  static async createCategory(req: NextRequest) {
    try {
      const { name, image } = await req.json()

      if (!name) {
        return NextResponse.json(
          { error: 'Category name is required' },
          { status: 400 }
        )
      }

      const category = await CategoryModel.create({ name, image })

      return NextResponse.json({
        success: true,
        data: category,
        message: 'Category created successfully'
      }, { status: 201 })
    } catch (error: any) {
      console.error('Create category error:', error)
      
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async getAllCategories(req: NextRequest) {
    try {
      const categories = await CategoryModel.getAll()

      return NextResponse.json({
        success: true,
        data: categories
      })
    } catch (error) {
      console.error('Get categories error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async getCategoryById(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const category = await CategoryModel.getById(params.id)

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: category
      })
    } catch (error) {
      console.error('Get category error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async updateCategory(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const data = await req.json()
      const category = await CategoryModel.update(params.id, data)

      return NextResponse.json({
        success: true,
        data: category,
        message: 'Category updated successfully'
      })
    } catch (error: any) {
      console.error('Update category error:', error)
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async deleteCategory(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      await CategoryModel.delete(params.id)

      return NextResponse.json({
        success: true,
        message: 'Category deleted successfully'
      })
    } catch (error: any) {
      console.error('Delete category error:', error)
      
      if (error.message.includes('Cannot delete category with food items')) {
        return NextResponse.json(
          { error: 'Cannot delete category that contains food items' },
          { status: 400 }
        )
      }
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async toggleCategoryStatus(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const category = await CategoryModel.toggleStatus(params.id)

      return NextResponse.json({
        success: true,
        data: category,
        message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`
      })
    } catch (error: any) {
      console.error('Toggle category status error:', error)
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  // Food Item Controllers
  static async createFoodItem(req: NextRequest) {
    try {
      const { name, description, price, image, categoryId, isAvailable = true } = await req.json()

      if (!name || !price || !categoryId) {
        return NextResponse.json(
          { error: 'Name, price, and category are required' },
          { status: 400 }
        )
      }

      if (price < 0) {
        return NextResponse.json(
          { error: 'Price must be a positive number' },
          { status: 400 }
        )
      }

      const foodItem = await FoodItemModel.create({
        name,
        description,
        price,
        image,
        categoryId,
        isAvailable
      })

      return NextResponse.json({
        success: true,
        data: foodItem,
        message: 'Food item created successfully'
      }, { status: 201 })
    } catch (error: any) {
      console.error('Create food item error:', error)
      
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Invalid category ID' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async getAllFoodItems(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const categoryId = searchParams.get('categoryId') || undefined
      const query = searchParams.get('q')

      let foodItems
      if (query) {
        foodItems = await FoodItemModel.search(query)
      } else {
        foodItems = await FoodItemModel.getAll(categoryId)
      }

      return NextResponse.json({
        success: true,
        data: foodItems
      })
    } catch (error) {
      console.error('Get food items error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async getFoodItemById(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const foodItem = await FoodItemModel.getById(params.id)

      if (!foodItem) {
        return NextResponse.json(
          { error: 'Food item not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: foodItem
      })
    } catch (error) {
      console.error('Get food item error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async updateFoodItem(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    // Handle both sync and async params
    const resolvedParams = 'then' in params ? await params : params
    const data = await req.json()
    
    console.log('🔄 Updating food item ID:', resolvedParams.id)
    console.log('📝 Update data:', data)
    
    // First verify the food item exists
    const existingItem = await FoodItemModel.getById(resolvedParams.id)
    if (!existingItem) {
      console.log('❌ Food item not found:', resolvedParams.id)
      return NextResponse.json(
        { error: 'Food item not found' },
        { status: 404 }
      )
    }
    
    console.log('✅ Found existing item:', existingItem.name)
    
    if (data.price !== undefined && data.price < 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      )
    }

    // Update the existing record
    const updatedFoodItem = await FoodItemModel.update(resolvedParams.id, data)
    
    console.log('✅ Food item updated successfully:', updatedFoodItem.name)

    return NextResponse.json({
      success: true,
      data: updatedFoodItem,
      message: 'Food item updated successfully'
    })
  } catch (error: any) {
    console.error('Update food item error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Food item not found' },
        { status: 404 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

  static async deleteFoodItem(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      await FoodItemModel.delete(params.id)

      return NextResponse.json({
        success: true,
        message: 'Food item deleted successfully'
      })
    } catch (error: any) {
      console.error('Delete food item error:', error)
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Food item not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async toggleFoodItemAvailability(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const foodItem = await FoodItemModel.toggleAvailability(params.id)

      return NextResponse.json({
        success: true,
        data: foodItem,
        message: `Food item ${foodItem.isAvailable ? 'made available' : 'made unavailable'}`
      })
    } catch (error: any) {
      console.error('Toggle food item availability error:', error)
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Food item not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}