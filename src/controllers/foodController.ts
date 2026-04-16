// controllers/foodController.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  CategoryModel,
  FoodItemModel,
  VariantModel,
  CreateCategoryData,
  UpdateCategoryData,
  CreateFoodItemData,
  UpdateFoodItemData,
  CreateVariantData,
  UpdateVariantData,
} from '@/models/Food'
import { uploadToCloudinary, deleteFromCloudinary } from '@/utils/cloudinary'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function handleImageUpload(imageFile: File | null): Promise<string | undefined> {
  if (!imageFile) return undefined
  const bytes = await imageFile.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const imageUrl = await uploadToCloudinary({ buffer, originalname: imageFile.name })
  if (!imageUrl) throw new Error('Failed to upload image')
  return imageUrl
}

// Resolve Next.js 15 params (can be Promise or plain object)
async function resolveParams(params: Promise<{ id: string }> | { id: string }) {
  return 'then' in params ? await params : params
}

// ─── FoodController ───────────────────────────────────────────────────────────

export class FoodController {
  // ── Categories ──────────────────────────────────────────────────────────────

  static async createCategory(req: NextRequest): Promise<NextResponse> {
    try {
      const formData = await req.formData()
      const name = (formData.get('name') as string)?.trim()
      const imageFile = formData.get('image') as File | null

      if (!name) {
        return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
      }

      const imageUrl = await handleImageUpload(imageFile)
      const category = await CategoryModel.create({ name, image: imageUrl })

      return NextResponse.json(
        { success: true, data: category, message: 'Category created successfully' },
        { status: 201 }
      )
    } catch (error: any) {
      console.error('Create category error:', error)
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
  }

  static async getAllCategories(_req: NextRequest): Promise<NextResponse> {
    try {
      const categories = await CategoryModel.getAll()
      return NextResponse.json(
        { success: true, data: categories },
        { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } }
      )
    } catch (error) {
      console.error('Get categories error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  static async getCategoryById(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
  ): Promise<NextResponse> {
    try {
      const { id } = await resolveParams(params)
      const category = await CategoryModel.getById(id)
      if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      return NextResponse.json(
        { success: true, data: category },
        { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } }
      )
    } catch (error) {
      console.error('Get category error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  static async updateCategory(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
  ): Promise<NextResponse> {
    try {
      const { id } = await resolveParams(params)
      const formData = await req.formData()
      const name = (formData.get('name') as string)?.trim()
      const imageFile = formData.get('image') as File | null
      const removeImage = formData.get('removeImage') === 'true'

      const existing = await CategoryModel.getById(id)
      if (!existing) return NextResponse.json({ error: 'Category not found' }, { status: 404 })

      const updateData: UpdateCategoryData = {}
      if (name) updateData.name = name

      if (removeImage) {
        if (existing.image) await deleteFromCloudinary(existing.image)
        updateData.image = undefined
      } else if (imageFile instanceof File) {
        if (existing.image) await deleteFromCloudinary(existing.image)
        updateData.image = await handleImageUpload(imageFile)
      }

      const category = await CategoryModel.update(id, updateData)
      return NextResponse.json({ success: true, data: category, message: 'Category updated successfully' })
    } catch (error: any) {
      console.error('Update category error:', error)
      if (error.code === 'P2025') return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
  }

  static async deleteCategory(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
  ): Promise<NextResponse> {
    try {
      const { id } = await resolveParams(params)
      const category = await CategoryModel.getById(id)
      if (category?.image) await deleteFromCloudinary(category.image)

      await CategoryModel.delete(id)
      return NextResponse.json({ success: true, message: 'Category deleted successfully' })
    } catch (error: any) {
      console.error('Delete category error:', error)
      if (error.message?.includes('Cannot delete category with food items')) {
        return NextResponse.json({ error: 'Cannot delete category that contains food items' }, { status: 400 })
      }
      if (error.code === 'P2025') return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
  }

  static async toggleCategoryStatus(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
  ): Promise<NextResponse> {
    try {
      const { id } = await resolveParams(params)
      const category = await CategoryModel.toggleStatus(id)
      return NextResponse.json({
        success: true,
        data: category,
        message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      })
    } catch (error: any) {
      console.error('Toggle category status error:', error)
      if (error.code === 'P2025') return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // ── Food Items ───────────────────────────────────────────────────────────────

  /**
   * POST /api/menu
   * Accepts optional `variants` as a JSON string in the FormData:
   *   variants = '[{"label":"Small","price":500,"isDefault":true},{"label":"Large","price":800}]'
   */
  static async createFoodItem(req: NextRequest): Promise<NextResponse> {
    try {
      const formData = await req.formData()
      const name = (formData.get('name') as string)?.trim()
      const description = (formData.get('description') as string)?.trim()
      const priceRaw = formData.get('price') as string
      const categoryId = (formData.get('categoryId') as string)?.trim()
      const isAvailable = formData.get('isAvailable') !== 'false'
      const imageFile = formData.get('image') as File | null
      const variantsRaw = formData.get('variants') as string | null

      if (!name || !categoryId) {
        return NextResponse.json({ error: 'Name and category are required' }, { status: 400 })
      }

      // Parse variants if provided
      let variants: CreateVariantData[] | undefined
      if (variantsRaw) {
        try {
          variants = JSON.parse(variantsRaw)
        } catch {
          return NextResponse.json({ error: 'Invalid variants JSON' }, { status: 400 })
        }
      }

      // Price is required only when no variants are supplied
      let price = 0
      if (!variants || variants.length === 0) {
        if (!priceRaw) {
          return NextResponse.json({ error: 'Price is required when no variants are provided' }, { status: 400 })
        }
        price = parseFloat(priceRaw)
        if (isNaN(price) || price < 0) {
          return NextResponse.json({ error: 'Price must be a valid positive number' }, { status: 400 })
        }
      } else {
        // Validate each variant
        for (const v of variants) {
          if (!v.label?.trim()) return NextResponse.json({ error: 'Each variant must have a label' }, { status: 400 })
          if (typeof v.price !== 'number' || v.price < 0) {
            return NextResponse.json({ error: `Variant "${v.label}" has an invalid price` }, { status: 400 })
          }
        }
        // Base price = first default variant price (model will sync)
        const defaultV = variants.find((v) => v.isDefault) ?? variants[0]
        price = defaultV.price
      }

      const imageUrl = await handleImageUpload(imageFile)
      const foodItem = await FoodItemModel.create({
        name,
        description: description || undefined,
        price,
        image: imageUrl,
        categoryId,
        isAvailable,
        variants,
      })

      return NextResponse.json(
        { success: true, data: foodItem, message: 'Food item created successfully' },
        { status: 201 }
      )
    } catch (error: any) {
      console.error('Create food item error:', error)
      if (error.code === 'P2003') return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
  }

  static async getAllFoodItems(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url)
      const categoryId = searchParams.get('categoryId') ?? undefined
      const query = searchParams.get('q')

      const foodItems = query
        ? await FoodItemModel.search(query)
        : await FoodItemModel.getAll(categoryId)

      return NextResponse.json(
        { success: true, data: foodItems },
        { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=30' } }
      )
    } catch (error) {
      console.error('Get food items error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  static async getFoodItemById(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
  ): Promise<NextResponse> {
    try {
      const { id } = await resolveParams(params)
      const foodItem = await FoodItemModel.getById(id)
      if (!foodItem) return NextResponse.json({ error: 'Food item not found' }, { status: 404 })
      return NextResponse.json(
        { success: true, data: foodItem },
        { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=30' } }
      )
    } catch (error) {
      console.error('Get food item error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  static async updateFoodItem(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
  ): Promise<NextResponse> {
    try {
      const { id } = await resolveParams(params)
      const formData = await req.formData()

      const name = (formData.get('name') as string)?.trim()
      const description = formData.get('description') as string
      const priceRaw = formData.get('price') as string | null
      const categoryId = (formData.get('categoryId') as string)?.trim()
      const isAvailableRaw = formData.get('isAvailable') as string | null
      const imageFile = formData.get('image') as File | null
      const removeImage = formData.get('removeImage') === 'true'

      const existing = await FoodItemModel.getById(id)
      if (!existing) return NextResponse.json({ error: 'Food item not found' }, { status: 404 })

      const updateData: UpdateFoodItemData = {}
      if (name) updateData.name = name
      if (description !== null) updateData.description = description || undefined
      if (priceRaw !== null) {
        const price = parseFloat(priceRaw)
        if (isNaN(price) || price < 0) {
          return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 })
        }
        updateData.price = price
      }
      if (categoryId) updateData.categoryId = categoryId
      if (isAvailableRaw !== null) updateData.isAvailable = isAvailableRaw === 'true'

      if (removeImage) {
        if (existing.image) await deleteFromCloudinary(existing.image)
        updateData.image = undefined
      } else if (imageFile instanceof File) {
        if (existing.image) await deleteFromCloudinary(existing.image)
        updateData.image = await handleImageUpload(imageFile)
      }

      const updatedFoodItem = await FoodItemModel.update(id, updateData)
      return NextResponse.json({ success: true, data: updatedFoodItem, message: 'Food item updated successfully' })
    } catch (error: any) {
      console.error('Update food item error:', error)
      if (error.code === 'P2025') return NextResponse.json({ error: 'Food item not found' }, { status: 404 })
      if (error.code === 'P2003') return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
  }

  static async deleteFoodItem(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
  ): Promise<NextResponse> {
    try {
      const { id } = await resolveParams(params)
      const foodItem = await FoodItemModel.getById(id)
      if (foodItem?.image) await deleteFromCloudinary(foodItem.image)
      await FoodItemModel.delete(id)
      return NextResponse.json({ success: true, message: 'Food item deleted successfully' })
    } catch (error: any) {
      console.error('Delete food item error:', error)
      if (error.code === 'P2025') return NextResponse.json({ error: 'Food item not found' }, { status: 404 })
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
  }

  static async toggleFoodItemAvailability(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
  ): Promise<NextResponse> {
    try {
      const { id } = await resolveParams(params)
      const foodItem = await FoodItemModel.toggleAvailability(id)
      return NextResponse.json({
        success: true,
        data: foodItem,
        message: `Food item ${foodItem.isAvailable ? 'made available' : 'made unavailable'}`,
      })
    } catch (error: any) {
      console.error('Toggle food item availability error:', error)
      if (error.code === 'P2025') return NextResponse.json({ error: 'Food item not found' }, { status: 404 })
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // ── Variants ─────────────────────────────────────────────────────────────────

  /**
   * GET /api/menu/[id]/variants
   * Returns all variants (including inactive) for admin management.
   */
  static async getVariants(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
  ): Promise<NextResponse> {
    try {
      const { id } = await resolveParams(params)
      const variants = await VariantModel.getByFoodItem(id)
      return NextResponse.json({ success: true, data: variants })
    } catch (error) {
      console.error('Get variants error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  /**
   * POST /api/menu/[id]/variants
   * Body: { label, price, isDefault?, sortOrder? }
   */
  static async createVariant(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
  ): Promise<NextResponse> {
    try {
      const { id } = await resolveParams(params)
      const body = await req.json()
      const { label, price, isDefault = false, sortOrder = 0 } = body

      if (!label?.trim()) {
        return NextResponse.json({ error: 'Variant label is required' }, { status: 400 })
      }
      if (typeof price !== 'number' || price < 0) {
        return NextResponse.json({ error: 'Valid price is required' }, { status: 400 })
      }

      const variant = await VariantModel.create(id, { label: label.trim(), price, isDefault, sortOrder })
      return NextResponse.json(
        { success: true, data: variant, message: 'Variant created successfully' },
        { status: 201 }
      )
    } catch (error: any) {
      console.error('Create variant error:', error)
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'A variant with this label already exists for this item' }, { status: 400 })
      }
      if (error.code === 'P2003') {
        return NextResponse.json({ error: 'Food item not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
  }

  /**
   * PUT /api/menu/[id]/variants/[variantId]
   * Body: { label?, price?, isDefault?, sortOrder?, isActive? }
   */
  static async updateVariant(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; variantId: string }> | { id: string; variantId: string } }
  ): Promise<NextResponse> {
    try {
      const resolvedParams = 'then' in params ? await params : params
      const { variantId } = resolvedParams
      const body: UpdateVariantData = await req.json()

      if (body.price !== undefined && (typeof body.price !== 'number' || body.price < 0)) {
        return NextResponse.json({ error: 'Price must be a valid positive number' }, { status: 400 })
      }

      const variant = await VariantModel.update(variantId, body)
      return NextResponse.json({ success: true, data: variant, message: 'Variant updated successfully' })
    } catch (error: any) {
      console.error('Update variant error:', error)
      if (error.message === 'Variant not found' || error.code === 'P2025') {
        return NextResponse.json({ error: 'Variant not found' }, { status: 404 })
      }
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'A variant with this label already exists for this item' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
  }

  /**
   * DELETE /api/menu/[id]/variants/[variantId]
   */
  static async deleteVariant(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string; variantId: string }> | { id: string; variantId: string } }
  ): Promise<NextResponse> {
    try {
      const resolvedParams = 'then' in params ? await params : params
      const { variantId } = resolvedParams
      await VariantModel.delete(variantId)
      return NextResponse.json({ success: true, message: 'Variant deleted successfully' })
    } catch (error: any) {
      console.error('Delete variant error:', error)
      if (error.message === 'Variant not found' || error.code === 'P2025') {
        return NextResponse.json({ error: 'Variant not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
  }

  /**
   * PATCH /api/menu/[id]/variants/[variantId]/toggle
   */
  static async toggleVariantStatus(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string; variantId: string }> | { id: string; variantId: string } }
  ): Promise<NextResponse> {
    try {
      const resolvedParams = 'then' in params ? await params : params
      const { variantId } = resolvedParams
      const variant = await VariantModel.toggleActive(variantId)
      return NextResponse.json({
        success: true,
        data: variant,
        message: `Variant ${variant.isActive ? 'activated' : 'deactivated'} successfully`,
      })
    } catch (error: any) {
      console.error('Toggle variant status error:', error)
      if (error.message === 'Variant not found' || error.code === 'P2025') {
        return NextResponse.json({ error: 'Variant not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}