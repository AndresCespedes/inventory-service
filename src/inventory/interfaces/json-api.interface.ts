import { ApiProperty } from '@nestjs/swagger';

export class JsonApiData {
  @ApiProperty({ example: 'inventory' })
  type: string;

  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({
    example: {
      quantity: 100
    }
  })
  attributes: Record<string, any>;

  @ApiProperty({
    example: {
      product: {
        data: {
          type: 'product',
          id: '1'
        }
      }
    }
  })
  relationships?: Record<string, { data: { type: string; id: string } }>;
}

export class JsonApiResource {
  @ApiProperty()
  data: JsonApiData;

  @ApiProperty({
    example: [
      {
        type: 'product',
        id: '1',
        attributes: {
          name: 'Producto de ejemplo',
          price: 99.99
        }
      }
    ],
    required: false
  })
  included?: Array<{
    type: string;
    id: string;
    attributes: Record<string, any>;
  }>;

  @ApiProperty({
    example: {
      self: '/inventory/1'
    }
  })
  links: Record<string, string>;
}

export class JsonApiError {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Inventario para el producto con id 999 no encontrado' })
  message: string | string[];

  @ApiProperty({ example: 'Not Found' })
  error?: string;
} 