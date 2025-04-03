import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateStockDto {
  @ApiProperty({ example: 1, description: 'ID del producto' })
  @IsInt()
  productId: number;

  @ApiProperty({ example: 50, description: 'Cantidad a actualizar' })
  @IsInt()
  @Min(0)
  quantity: number;
}
