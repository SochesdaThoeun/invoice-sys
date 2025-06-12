import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Product } from './entities/Product';
import { TaxCode } from './entities/TaxCode';
import { Customer } from './entities/Customer';
import { Quote } from './entities/Quote';
import { Order } from './entities/Order';
import { Invoice } from './entities/Invoice';
import { Category } from './entities/Category';
import { LedgerEntry } from './entities/LedgerEntry';
import { AIRequest } from './entities/AIRequest';
import { BusinessAddress } from './entities/BusinessAddress';
import { PaymentType } from './entities/PaymentType';
import { OrderCart } from './entities/OrderCart';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5458', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'invoice_sys',
  entities: [
    User, 
    Product, 
    TaxCode, 
    Customer, 
    Quote, 
    Order, 
    Invoice, 
    Category, 
    LedgerEntry, 
    AIRequest,
    BusinessAddress,
    PaymentType,
    OrderCart
  ],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
  logging: true,
}); 


