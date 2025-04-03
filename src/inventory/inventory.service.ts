import { Injectable, NotFoundException, Logger, Inject, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import axios, { AxiosResponse } from 'axios';
import { catchError, lastValueFrom, retry, timeout } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class InventoryService {
  private readonly productsServiceUrl: string;
  private readonly logger = new Logger(InventoryService.name);
  // Flag para facilitar los tests
  private testMode = false;

  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    private httpService: HttpService,
    // Usar inyección de dependencias para el modo de prueba
    @Optional() @Inject('TEST_MODE') testMode = false
  ) {
    this.testMode = testMode;
    this.productsServiceUrl = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3000';
    if (!this.testMode) {
      this.logger.log(`Servicio de productos configurado en: ${this.productsServiceUrl}`);
    }
  }

  // Consulta el inventario y además obtiene datos del producto del microservicio de productos.
  async findInventoryByProductId(productId: number): Promise<any> {
    let productData: any;
    if (!this.testMode) {
      this.logger.log(`Consultando inventario para el producto con id: ${productId}`);
    }
    
    // Lista de URLs a intentar en orden
    const urlsToTry = [
      `${this.productsServiceUrl}/products/${productId}`,
      `http://host.docker.internal:3000/products/${productId}`,
      `http://localhost:3000/products/${productId}`,
      `http://127.0.0.1:3000/products/${productId}`,
      `http://product-service:3000/products/${productId}`
    ];
    
    let lastError = null;
    
    // Intentar cada URL hasta que una funcione
    for (const url of urlsToTry) {
      try {
        if (!this.testMode) {
          this.logger.log(`Intentando consultar el servicio de productos en: ${url}`);
        }
        const response: AxiosResponse<any> = await axios.get(
          url,
          {
            headers: { 'x-api-key': process.env.API_KEY || 'my-secret-api-key' },
            timeout: 5000 // 5 segundos de timeout
          },
        );

        if (!this.testMode) {
          this.logger.log('Respuesta del servicio de productos obtenida correctamente');
        }
        productData = response.data;
        break; // Si llegamos aquí, la petición funcionó, salimos del bucle
      } catch (error) {
        if (!this.testMode) {
          this.logger.warn(`Error al consultar ${url}: ${error.message}`);
        }
        lastError = error;
        // Continuamos con la siguiente URL
      }
    }
    
    if (!productData) {
      if (!this.testMode) {
        this.logger.error(`No se pudo conectar al servicio de productos después de intentar todas las URLs`, lastError);
      }
      throw new NotFoundException(
        `El producto con id ${productId} no se encontró en el servicio de productos`,
      );
    }

    if (!this.testMode) {
      this.logger.log('Consultando el inventario...');
    }

    // Obtener el inventario asociado al producto
    const inventory = await this.inventoryRepository.findOne({
      where: { productId: productId },
    });
    if (!inventory) {
      throw new NotFoundException(
        `Inventario para el producto con id ${productId} no encontrado`,
      );
    }

    // Normalizar la respuesta del producto para asegurarnos de que tenga el formato correcto
    let productResource: any;
    
    // Si la respuesta ya tiene la estructura JSON API con data.type y data.id
    if (productData.data && productData.data.type && (productData.data.id || productData.data.id === 0)) {
      productResource = productData.data;
      
      // Asegurarse de que el ID sea string
      productResource.id = String(productResource.id);
    } else {
      // Si no, crear la estructura JSON API
      productResource = {
        type: 'product',
        id: String(productId),
        attributes: productData
      };
    }

    // Construir la respuesta siguiendo el estándar JSON API
    return {
      data: {
        type: 'inventory',
        id: String(inventory.id),
        attributes: {
          quantity: inventory.quantity
        },
        relationships: {
          product: {
            data: {
              type: 'product',
              id: String(productResource.id)
            }
          }
        }
      },
      included: [
        productResource
      ],
      links: {
        self: `/inventory/${productId}`
      }
    };
  }

  // Actualiza la cantidad disponible tras una compra y emite un evento simple.
  async updateInventory(
    productId: number,
    updateDto: UpdateInventoryDto,
  ): Promise<any> {
    if (!this.testMode) {
      this.logger.log(`Actualizando inventario para producto con id: ${productId}`);
    }
    
    // Verificar primero si el producto existe en el servicio de productos
    try {
      // Lista de URLs a intentar en orden
      const urlsToTry = [
        `${this.productsServiceUrl}/products/${productId}`,
        `http://host.docker.internal:3000/products/${productId}`,
        `http://localhost:3000/products/${productId}`,
        `http://127.0.0.1:3000/products/${productId}`,
        `http://product-service:3000/products/${productId}`
      ];
      
      let productExists = false;
      let productData = null;
      
      // Intentar cada URL hasta que una funcione
      for (const url of urlsToTry) {
        try {
          if (!this.testMode) {
            this.logger.log(`Verificando existencia del producto en: ${url}`);
          }
          const response = await axios.get(
            url,
            {
              headers: { 'x-api-key': process.env.API_KEY || 'my-secret-api-key' },
              timeout: 5000 // 5 segundos de timeout
            },
          );
          productExists = true;
          productData = response.data;
          break; // Si llegamos aquí, la petición funcionó, salimos del bucle
        } catch (error) {
          if (!this.testMode) {
            this.logger.warn(`Error al verificar producto en ${url}: ${error.message}`);
          }
          // Continuamos con la siguiente URL
        }
      }
      
      if (!productExists) {
        if (!this.testMode) {
          this.logger.error(`No se pudo verificar la existencia del producto ${productId}`);
        }
        throw new NotFoundException(`El producto con id ${productId} no existe`);
      }
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        if (!this.testMode) {
          this.logger.error(`Error al verificar el producto: ${error.message}`);
        }
      }
      throw error;
    }

    // Buscar el inventario
    const inventory = await this.inventoryRepository.findOne({
      where: { productId: productId },
    });
    
    if (!inventory) {
      if (!this.testMode) {
        this.logger.warn(`Inventario para el producto con id ${productId} no encontrado, se creará uno nuevo`);
      }
      // Si no existe inventario, lo creamos
      const newInventory = this.inventoryRepository.create({
        productId,
        quantity: updateDto.quantity
      });
      const savedInventory = await this.inventoryRepository.save(newInventory);
      
      if (!this.testMode) {
        this.logger.log(`Inventario creado para producto ${productId}: cantidad ${savedInventory.quantity}`);
      }
      
      // Emitir evento cuando el inventario cambia
      this.emitInventoryChangedEvent(productId, savedInventory.quantity, 'created');
      
      return {
        data: {
          type: 'inventory',
          id: String(savedInventory.id),
          attributes: {
            quantity: savedInventory.quantity
          },
          relationships: {
            product: {
              data: {
                type: 'product',
                id: String(productId)
              }
            }
          }
        },
        links: {
          self: `/inventory/${savedInventory.id}`
        }
      };
    }
    
    // Actualizar inventario existente
    const oldQuantity = inventory.quantity;
    inventory.quantity = updateDto.quantity;
    const updatedInventory = await this.inventoryRepository.save(inventory);

    if (!this.testMode) {
      this.logger.log(`Inventario actualizado para producto ${productId}: nueva cantidad ${updatedInventory.quantity}`);
    }
    
    // Emitir evento cuando el inventario cambia
    this.emitInventoryChangedEvent(productId, updatedInventory.quantity, 'updated', oldQuantity);

    return {
      data: {
        type: 'inventory',
        id: String(updatedInventory.id),
        attributes: {
          quantity: updatedInventory.quantity
        },
        relationships: {
          product: {
            data: {
              type: 'product',
              id: String(productId)
            }
          }
        }
      },
      links: {
        self: `/inventory/${updatedInventory.id}`
      }
    };
  }
  
  // Método para emitir un evento cuando cambia el inventario
  private emitInventoryChangedEvent(
    productId: number,
    quantity: number,
    action: 'created' | 'updated',
    oldQuantity?: number,
  ): void {
    // En una app real, aquí usaríamos un event emitter de NestJS o un service de mensajería
    if (!this.testMode) {
      this.logger.log(`Evento: Inventario ${action} para producto ${productId}.`);
      if (action === 'updated' && oldQuantity !== undefined) {
        this.logger.log(`Cantidad anterior: ${oldQuantity}, Nueva cantidad: ${quantity}`);
      }
    }
  }
}

