import { Controller, Get, Patch, Param, Body, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JsonApiResource, JsonApiError } from './interfaces/json-api.interface';

@ApiTags('Inventory')
@Controller('inventory')
@ApiBearerAuth('API-KEY')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(':productId')
  @ApiOperation({
    summary: 'Consultar inventario de un producto',
    description: 'Consulta la cantidad disponible de un producto y obtiene información adicional desde el servicio de productos',
  })
  @ApiParam({
    name: 'productId',
    required: true,
    description: 'ID único del producto',
    type: Number,
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Inventario obtenido correctamente',
    type: JsonApiResource
  })
  @ApiResponse({
    status: 404,
    description: 'Producto o inventario no encontrado',
    type: JsonApiError
  })
  findInventory(@Param('productId', ParseIntPipe) productId: number) {
    return this.inventoryService.findInventoryByProductId(productId);
  }

  @Patch(':productId')
  @ApiOperation({
    summary: 'Actualizar inventario',
    description: 'Actualiza la cantidad disponible de un producto tras una compra u otro evento. Si no existe el inventario, lo crea.'
  })
  @ApiParam({
    name: 'productId',
    required: true,
    description: 'ID único del producto',
    type: Number,
    example: 1
  })
  @ApiBody({
    type: UpdateInventoryDto,
    description: 'Datos de actualización del inventario'
  })
  @ApiResponse({
    status: 200,
    description: 'Inventario actualizado correctamente',
    type: JsonApiResource
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
    type: JsonApiError
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
    type: JsonApiError
  })
  updateInventory(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.updateInventory(productId, updateDto);
  }
}
