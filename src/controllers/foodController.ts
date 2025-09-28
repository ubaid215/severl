import { NextRequest, NextResponse } from 'next/server'
import { CategoryModel, FoodItemModel, CreateCategoryData, UpdateCategoryData, CreateFoodItemData, UpdateFoodItemData } from '@/models/Food'
import { uploadToCloudinary, deleteFromCloudinary } from '@/utils/cloudinary'

export class FoodController {
  // Helper method to handle image upload
  private static async handleImageUpload(imageFile: File | null): Promise<string | undefined> {
    if (!imageFile) return undefined;
    
    try {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const imageUrl = await uploadToCloudinary({ buffer, originalname: imageFile.name });
      return imageUrl || undefined;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Category Controllers
  static async createCategory(req: NextRequest): Promise<NextResponse> {
    try {
      const formData = await req.formData();
      const name = formData.get('name') as string;
      const imageFile = formData.get('image') as File | null;

      if (!name) {
        return NextResponse.json(
          { error: 'Category name is required' },
          { status: 400 }
        );
      }

      // Handle image upload
      const imageUrl = await this.handleImageUpload(imageFile);

      const categoryData: CreateCategoryData = {
        name, 
        image: imageUrl
      };

      const category = await CategoryModel.create(categoryData);

      return NextResponse.json({
        success: true,
        data: category,
        message: 'Category created successfully'
      }, { status: 201 });
    } catch (error: any) {
      console.error('Create category error:', error);
      
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  }

  static async getAllCategories(req: NextRequest): Promise<NextResponse> {
    try {
      const categories = await CategoryModel.getAll();

      return NextResponse.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  static async getCategoryById(
    req: NextRequest, 
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      const category = await CategoryModel.getById(params.id);

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Get category error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  static async updateCategory(
    req: NextRequest, 
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      const formData = await req.formData();
      const name = formData.get('name') as string;
      const imageFile = formData.get('image') as File | null;
      const removeImage = formData.get('removeImage') as string;

      const updateData: UpdateCategoryData = {};
      if (name) updateData.name = name;
      
      // Get existing category to handle image cleanup
      const existingCategory = await CategoryModel.getById(params.id);
      if (!existingCategory) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }

      // Handle image removal
      if (removeImage === 'true') {
        if (existingCategory.image) {
          await deleteFromCloudinary(existingCategory.image);
        }
        updateData.image = undefined;
      }
      
      // Handle new image upload
      if (imageFile instanceof File) {
        // Delete old image if exists
        if (existingCategory.image) {
          await deleteFromCloudinary(existingCategory.image);
        }
        
        // Upload new image
        const imageUrl = await this.handleImageUpload(imageFile);
        updateData.image = imageUrl;
      }

      const category = await CategoryModel.update(params.id, updateData);

      return NextResponse.json({
        success: true,
        data: category,
        message: 'Category updated successfully'
      });
    } catch (error: any) {
      console.error('Update category error:', error);
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  }

  static async deleteCategory(
    req: NextRequest, 
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      // Get category first to delete image
      const category = await CategoryModel.getById(params.id);
      
      if (category?.image) {
        await deleteFromCloudinary(category.image);
      }

      await CategoryModel.delete(params.id);

      return NextResponse.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete category error:', error);
      
      if (error.message.includes('Cannot delete category with food items')) {
        return NextResponse.json(
          { error: 'Cannot delete category that contains food items' },
          { status: 400 }
        );
      }
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  }

  static async toggleCategoryStatus(
    req: NextRequest, 
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      const category = await CategoryModel.toggleStatus(params.id);

      return NextResponse.json({
        success: true,
        data: category,
        message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error: any) {
      console.error('Toggle category status error:', error);
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  // Food Item Controllers
  static async createFoodItem(req: NextRequest): Promise<NextResponse> {
    try {
      const formData = await req.formData();
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const price = parseFloat(formData.get('price') as string);
      const categoryId = formData.get('categoryId') as string;
      const isAvailable = formData.get('isAvailable') === 'true';
      const imageFile = formData.get('image') as File | null;

      if (!name || !price || !categoryId) {
        return NextResponse.json(
          { error: 'Name, price, and category are required' },
          { status: 400 }
        );
      }

      if (price < 0 || isNaN(price)) {
        return NextResponse.json(
          { error: 'Price must be a valid positive number' },
          { status: 400 }
        );
      }

      // Handle image upload
      const imageUrl = await this.handleImageUpload(imageFile);

      const foodItemData: CreateFoodItemData = {
        name,
        description: description || undefined,
        price,
        image: imageUrl,
        categoryId,
        isAvailable
      };

      const foodItem = await FoodItemModel.create(foodItemData);

      return NextResponse.json({
        success: true,
        data: foodItem,
        message: 'Food item created successfully'
      }, { status: 201 });
    } catch (error: any) {
      console.error('Create food item error:', error);
      
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Invalid category ID' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  }

  static async getAllFoodItems(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const categoryId = searchParams.get('categoryId') || undefined;
      const query = searchParams.get('q');

      let foodItems;
      if (query) {
        foodItems = await FoodItemModel.search(query);
      } else {
        foodItems = await FoodItemModel.getAll(categoryId);
      }

      return NextResponse.json({
        success: true,
        data: foodItems
      });
    } catch (error) {
      console.error('Get food items error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  static async getFoodItemById(
    req: NextRequest, 
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      const foodItem = await FoodItemModel.getById(params.id);

      if (!foodItem) {
        return NextResponse.json(
          { error: 'Food item not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: foodItem
      });
    } catch (error) {
      console.error('Get food item error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  static async updateFoodItem(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> | { id: string } }
  ): Promise<NextResponse> {
    try {
      const resolvedParams = 'then' in params ? await params : params;
      const formData = await req.formData();
      
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const price = formData.get('price') ? parseFloat(formData.get('price') as string) : undefined;
      const categoryId = formData.get('categoryId') as string;
      const isAvailable = formData.get('isAvailable') as string;
      const imageFile = formData.get('image') as File | null;
      const removeImage = formData.get('removeImage') as string;

      // First verify the food item exists
      const existingItem = await FoodItemModel.getById(resolvedParams.id);
      if (!existingItem) {
        return NextResponse.json(
          { error: 'Food item not found' },
          { status: 404 }
        );
      }

      const updateData: UpdateFoodItemData = {};

      if (name) updateData.name = name;
      if (description !== null) updateData.description = description || undefined;
      if (price !== undefined) updateData.price = price;
      if (categoryId) updateData.categoryId = categoryId;
      if (isAvailable !== null) updateData.isAvailable = isAvailable === 'true';

      // Handle price validation
      if (price !== undefined && price < 0) {
        return NextResponse.json(
          { error: 'Price must be a positive number' },
          { status: 400 }
        );
      }

      // Handle image removal
      if (removeImage === 'true') {
        if (existingItem.image) {
          await deleteFromCloudinary(existingItem.image);
        }
        updateData.image = undefined;
      }
      
      // Handle new image upload
      if (imageFile instanceof File) {
        // Delete old image if exists
        if (existingItem.image) {
          await deleteFromCloudinary(existingItem.image);
        }
        
        // Upload new image
        const imageUrl = await this.handleImageUpload(imageFile);
        updateData.image = imageUrl;
      }

      const updatedFoodItem = await FoodItemModel.update(resolvedParams.id, updateData);

      return NextResponse.json({
        success: true,
        data: updatedFoodItem,
        message: 'Food item updated successfully'
      });
    } catch (error: any) {
      console.error('Update food item error:', error);
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Food item not found' },
          { status: 404 }
        );
      }
      
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Invalid category ID' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  }

  static async deleteFoodItem(
    req: NextRequest, 
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      // Get food item first to delete image
      const foodItem = await FoodItemModel.getById(params.id);
      
      if (foodItem?.image) {
        await deleteFromCloudinary(foodItem.image);
      }

      await FoodItemModel.delete(params.id);

      return NextResponse.json({
        success: true,
        message: 'Food item deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete food item error:', error);
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Food item not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  }

  static async toggleFoodItemAvailability(
    req: NextRequest, 
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      const foodItem = await FoodItemModel.toggleAvailability(params.id);

      return NextResponse.json({
        success: true,
        data: foodItem,
        message: `Food item ${foodItem.isAvailable ? 'made available' : 'made unavailable'}`
      });
    } catch (error: any) {
      console.error('Toggle food item availability error:', error);
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Food item not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}