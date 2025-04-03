import { Test } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { HttpService } from '@nestjs/axios';
import { NotFoundException } from '@nestjs/common';
import axios from 'axios';

// Mock de axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock básico de Logger para evitar problemas
jest.mock('@nestjs/common', () => {
  const original = jest.requireActual('@nestjs/common');
  return {
    ...original,
    Logger: jest.fn().mockImplementation(() => ({
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn()
    }))
  };
});

describe('InventoryService', () => {
  let service: InventoryService;
  let repository: any;

  beforeEach(async () => {
    // Configurar variables de entorno ANTES de crear el servicio
    process.env.PRODUCTS_SERVICE_URL = 'http://test-products-service:3000';
    process.env.API_KEY = 'test-api-key';

    // Crear mocks
    repository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };
    
    const httpService = { get: jest.fn() };

    // Crear una instancia del servicio directamente
    const module = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Inventory),
          useValue: repository,
        },
        {
          provide: HttpService,
          useValue: httpService,
        },
        {
          provide: 'TEST_MODE',
          useValue: true,
        }
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  // Prueba simple para constructor
  it('debería inicializar con la URL configurada', () => {
    expect((service as any).productsServiceUrl).toBe('http://test-products-service:3000');
  });

  // Prueba simple para obtener inventario
  it('debería encontrar inventario y convertir respuesta a formato JSON API', async () => {
    const mockInventory = { id: 1, productId: 1, quantity: 50 };
    const mockProductResponse = { data: { type: 'product', id: '1', attributes: { name: 'Test' } } };
    
    repository.findOne.mockResolvedValue(mockInventory);
    mockAxios.get.mockResolvedValue({ data: mockProductResponse });
    
    const result = await service.findInventoryByProductId(1);
    
    expect(result.data.type).toBe('inventory');
    expect(result.data.id).toBe('1');
    expect(result.data.attributes.quantity).toBe(50);
    expect(result.included[0].type).toBe('product');
  });

  // Prueba simple para actualizar inventario
  it('debería actualizar inventario existente', async () => {
    const existingInventory = { id: 1, productId: 1, quantity: 10 };
    const updatedInventory = { id: 1, productId: 1, quantity: 20 };
    const mockProductResponse = { data: { type: 'product', id: '1' } };
    
    repository.findOne.mockResolvedValue(existingInventory);
    repository.save.mockResolvedValue(updatedInventory);
    mockAxios.get.mockResolvedValue({ data: mockProductResponse });
    
    const result = await service.updateInventory(1, { quantity: 20 });
    
    expect(result.data.type).toBe('inventory');
    expect(result.data.attributes.quantity).toBe(20);
  });

  // Prueba simple para crear inventario
  it('debería crear nuevo inventario si no existe', async () => {
    const newInventory = { id: 1, productId: 1, quantity: 30 };
    const mockProductResponse = { data: { type: 'product', id: '1' } };
    
    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue(newInventory);
    repository.save.mockResolvedValue(newInventory);
    mockAxios.get.mockResolvedValue({ data: mockProductResponse });
    
    const result = await service.updateInventory(1, { quantity: 30 });
    
    expect(result.data.type).toBe('inventory');
    expect(result.data.attributes.quantity).toBe(30);
  });

  // Prueba simple para manejo de error
  it('debería lanzar error si el inventario no existe', async () => {
    const mockProductResponse = { data: { type: 'product', id: '1' } };
    
    repository.findOne.mockResolvedValue(null);
    mockAxios.get.mockResolvedValue({ data: mockProductResponse });
    
    await expect(service.findInventoryByProductId(1)).rejects.toThrow(NotFoundException);
  });
});
