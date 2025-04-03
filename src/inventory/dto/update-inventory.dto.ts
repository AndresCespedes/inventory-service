import { IsNotEmpty, IsNumber, Min, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInventoryDto {
  @ApiProperty({ 
    example: 45, 
    description: 'Nueva cantidad tras una compra', 
    minimum: 0,
    type: Number,
    required: true 
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  quantity: number;
}
