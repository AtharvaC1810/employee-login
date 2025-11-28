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
    // ✅ Global Config
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ✅ Serve Static Uploads Folder (correct usage)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Physical folder
      serveRoot: '/uploads', // URL base path
    }),

    // ✅ TypeORM Database Configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DB_HOST');
        const port = Number(configService.get<number>('DB_PORT') || 5432);
        const username = configService.get<string>('DB_USERNAME');
        const password = configService.get<string>('DB_PASSWORD');
        const database = configService.get<string>('DB_NAME');

        if (!host || !port || !username || !password || !database) {
          throw new Error(
            'Database configuration is missing in .env or environment variables',
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
          synchronize: true,
        };
      },
    }),

    // ✅ Modules
    UsersModule,
    AuthModule,
    PermissionsModule,
    VendorsModule,
    ProductsModule,
  ],
})
export class AppModule {}
