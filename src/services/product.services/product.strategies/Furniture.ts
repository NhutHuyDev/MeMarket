import { TProductSchema } from '@src/schema/product.request.schemas'
import IProductStategy from './IProductStategy'
import { TypeOf, object, string } from 'zod'
import { BadRequestResponse, UnauthorizedResponse } from '@src/core/error.responses'
import ProductModel from '@src/models/product.model'
import { OkResponse } from '@src/core/success.responses'
import { ValidateSchema } from '@src/utils/validateSchema'
import slugify from 'slugify'

export class Furnitures implements IProductStategy {
  async Create(input: TProductSchema & TAttributeFurnitureSchema) {
    const validateResult = ValidateSchema(AttributeFurnitureSchema, { body: input })

    if (!validateResult.IsValid && validateResult.Message) {
      return new BadRequestResponse(validateResult.Message)
    }

    const ProductAttributes = [
      { code: 'Brand', value: input.ProductAttributes?.Brand, name: 'Brand' },
      { code: 'Model', value: input.ProductAttributes?.Model, name: 'Model' },
      { code: 'Color', value: input.ProductAttributes?.Color, name: 'Color' }
    ]

    const newProduct = await ProductModel.create({
      ...input,
      ProductAttributes: ProductAttributes
    })

    return new OkResponse({
      newProduct: newProduct
    })
  }

  async Update(input: TProductSchema & TAttributeFurnitureSchema) {
    const validateResult = ValidateSchema(AttributeFurnitureSchema, { body: input })

    if (!validateResult.IsValid && validateResult.Message) {
      return new BadRequestResponse(validateResult.Message)
    }

    input.ProductSlug = slugify(input.ProductName)

    const ProductAttributes = [
      { code: 'Brand', value: input.ProductAttributes?.Brand, name: 'Brand' },
      { code: 'Model', value: input.ProductAttributes?.Model, name: 'Model' },
      { code: 'Color', value: input.ProductAttributes?.Color, name: 'Color' }
    ]

    const updatedProduct = await ProductModel.findOneAndUpdate(
      {
        _id: input.ProductId,
        Seller: input.Seller
      },
      {
        ...input,
        ProductAttributes: ProductAttributes
      },
      {
        new: true
      }
    )

    if (updatedProduct) {
      return new OkResponse({
        updatedProduct: updatedProduct
      })
    } else {
      return new UnauthorizedResponse('cannot update the product')
    }
  }
}

const AttributeFurnitureSchema = object({
  body: object({
    ProductAttributes: object(
      {
        Brand: string({
          required_error: "furniture's brand is required"
        }),
        Model: string({
          required_error: "furniture's model is required"
        }),
        Color: string({
          required_error: "furniture's color is required"
        })
      },
      { required_error: "furniture's attributes are required" }
    )
  })
})

type TAttributeFurnitureSchema = TypeOf<typeof AttributeFurnitureSchema>['body']
