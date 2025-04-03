import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { HttpService } from '@nestjs/axios';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

// Mock de Logger - hacemos un enfoque diferente
const mockLoggerService = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn()
};

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  beforeEach(async () => {
    // Crear un mock service en lugar de usar TestingModule
    service = {
      findInventoryByProductId: jest.fn(),
      updateInventory: jest.fn()
    } as unknown as InventoryService;

    // Crear el controlador directamente con el servicio mock
    controller = new InventoryController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findInventory', () => {
    it('debe llamar al servicio para encontrar inventario por productId', async () => {
      const mockResult = {
        data: {
          type: 'inventory',
          id: '1',
          attributes: {
            quantity: 100
          }
        }
      };
      
      jest.spyOn(service, 'findInventoryByProductId').mockResolvedValue(mockResult);
      
      const result = await controller.findInventory(1);
      expect(service.findInventoryByProductId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateInventory', () => {
    it('debe llamar al servicio para actualizar inventario', async () => {
      const mockResult = {
        data: {
          type: 'inventory',
          id: '1',
          attributes: {
            quantity: 50
          }
        }
      };
      
      const updateDto: UpdateInventoryDto = { quantity: 50 };
      
      jest.spyOn(service, 'updateInventory').mockResolvedValue(mockResult);
      
      const result = await controller.updateInventory(1, updateDto);
      expect(service.updateInventory).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(mockResult);
    });
  });
});
