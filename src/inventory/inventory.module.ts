import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    {
      provide: 'TEST_MODE',
      useValue: false,
    }
  ],
  exports: [TypeOrmModule],
})
export class InventoryModule {}
