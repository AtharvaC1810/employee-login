import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PermissionsModule } from './permissions/permissions.module';
import { VendorsModule } from './vendors/vendors.module';
import { ProductsModule } from './products/products.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    // ✅ Global .env Support
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ✅ Static file serving for uploads/products
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // maps folder
      serveRoot: '/uploads', // URL prefix → http://localhost:3000/uploads/*
    }),

    // ✅ TypeORM Database Config
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('DB_HOST');
        const port = Number(config.get<number>('DB_PORT') || 5432);
        const username = config.get<string>('DB_USERNAME');
        const password = config.get<string>('DB_PASSWORD');
        const database = config.get<string>('DB_NAME');

        if (!host || !port || !username || !password || !database) {
          throw new Error(
            '❌ Missing database configuration variables in .env',
          );
        }

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          autoLoadEntities: true,
          synchronize: true, // ❗ optional — disable in production
        };
      },
    }),

    // ✅ Feature Modules
    UsersModule,
    AuthModule,
    PermissionsModule,
    VendorsModule,
    ProductsModule,
  ],
})
export class AppModule {}
