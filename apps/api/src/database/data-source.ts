import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';

console.log('Loading DataSource...');
console.log(process.env.DATABASE_HOST);
console.log(process.env.DATABASE_NAME);

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,

  entities: [User],

  migrations: ['src/database/migrations/*.ts'],

  synchronize: false,
  logging: true,
});
