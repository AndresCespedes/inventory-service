import { DataSource, DataSourceOptions } from 'typeorm';
import { Inventory } from '../inventory/entities/inventory.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres_db_inventory',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'inventory',
  entities: [Inventory],
  synchronize: true,
  logging: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
