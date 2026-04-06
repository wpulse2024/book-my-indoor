import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Permission,
  PermissionSchema,
} from '../permissions/schemas/permission.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
        maxPoolSize: 2,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [SeederService],
})
export class SeederModule {}
