import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserController } from './controllers/users.controller';
import { UserService } from './services/users.service';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    // Loads env variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    //Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    UsersModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}
