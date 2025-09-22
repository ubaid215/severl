import { NextRequest, NextResponse } from 'next/server'
import { SpecialDealModel } from '@/models/specialDeals'

export class SpecialDealsController {
  static async createDeal(req: NextRequest) {
    try {
      const { 
        title, 
        description, 
        image, 
        discount, 
        discountType, 
        minOrderAmount, 
        validFrom, 
        validTo 
      } = await req.json()

      if (!title || !description || discount === undefined || !discountType || !validFrom || !validTo) {
        return NextResponse.json(
          { error: 'Title, description, discount, discount type, valid from, and valid to are required' },
          { status: 400 }
        )
      }

      if (discount <= 0) {
        return NextResponse.json(
          { error: 'Discount must be greater than 0' },
          { status: 400 }
        )
      }

      if (discountType === 'PERCENTAGE' && discount > 100) {
        return NextResponse.json(
          { error: 'Percentage discount cannot exceed 100%' },
          { status: 400 }
        )
      }

      const validFromDate = new Date(validFrom)
      const validToDate = new Date(validTo)

      if (validFromDate >= validToDate) {
        return NextResponse.json(
          { error: 'Valid from date must be before valid to date' },
          { status: 400 }
        )
      }

      const deal = await SpecialDealModel.create({
        title,
        description,
        image,
        discount,
        discountType,
        minOrderAmount: minOrderAmount || null,
        validFrom: validFromDate,
        validTo: validToDate
      })

      return NextResponse.json({
        success: true,
        data: deal,
        message: 'Special deal created successfully'
      }, { status: 201 })
    } catch (error) {
      console.error('Create deal error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async getAllDeals(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const activeOnly = searchParams.get('active') === 'true'

      let deals
      if (activeOnly) {
        deals = await SpecialDealModel.getActive()
      } else {
        deals = await SpecialDealModel.getAll()
      }

      return NextResponse.json({
        success: true,
        data: deals
      })
    } catch (error) {
      console.error('Get deals error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async getDealById(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const deal = await SpecialDealModel.getById(params.id)

      if (!deal) {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: deal
      })
    } catch (error) {
      console.error('Get deal error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async updateDeal(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const data = await req.json()

      if (data.discount !== undefined && data.discount <= 0) {
        return NextResponse.json(
          { error: 'Discount must be greater than 0' },
          { status: 400 }
        )
      }

      if (data.discountType === 'PERCENTAGE' && data.discount > 100) {
        return NextResponse.json(
          { error: 'Percentage discount cannot exceed 100%' },
          { status: 400 }
        )
      }

      if (data.validFrom && data.validTo) {
        const validFromDate = new Date(data.validFrom)
        const validToDate = new Date(data.validTo)

        if (validFromDate >= validToDate) {
          return NextResponse.json(
            { error: 'Valid from date must be before valid to date' },
            { status: 400 }
          )
        }

        data.validFrom = validFromDate
        data.validTo = validToDate
      } else if (data.validFrom) {
        data.validFrom = new Date(data.validFrom)
      } else if (data.validTo) {
        data.validTo = new Date(data.validTo)
      }

      const deal = await SpecialDealModel.update(params.id, data)

      return NextResponse.json({
        success: true,
        data: deal,
        message: 'Deal updated successfully'
      })
    } catch (error: any) {
      console.error('Update deal error:', error)
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async deleteDeal(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      await SpecialDealModel.delete(params.id)

      return NextResponse.json({
        success: true,
        message: 'Deal deleted successfully'
      })
    } catch (error: any) {
      console.error('Delete deal error:', error)
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async toggleDealStatus(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const deal = await SpecialDealModel.toggleStatus(params.id)

      return NextResponse.json({
        success: true,
        data: deal,
        message: `Deal ${deal.isActive ? 'activated' : 'deactivated'} successfully`
      })
    } catch (error: any) {
      console.error('Toggle deal status error:', error)
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async getValidDealsForOrder(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url)
      const orderAmount = parseFloat(searchParams.get('amount') || '0')

      if (orderAmount <= 0) {
        return NextResponse.json(
          { error: 'Valid order amount is required' },
          { status: 400 }
        )
      }

      const deals = await SpecialDealModel.getValidDealsForOrder(orderAmount)

      // Calculate actual discount for each deal
      const dealsWithDiscount = deals.map(deal => ({
        ...deal,
        actualDiscount: SpecialDealModel.calculateDiscount(deal, orderAmount)
      }))

      return NextResponse.json({
        success: true,
        data: dealsWithDiscount
      })
    } catch (error) {
      console.error('Get valid deals error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}