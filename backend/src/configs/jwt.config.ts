import { ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';

const jwtModuleOptions = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.get('jwtSecret'),
  signOptions: {
    expiresIn: configService.get('jwtExp', '5m'),
  },
});

export const jwtOptions = (): JwtModuleAsyncOptions => ({
  useFactory: (configService: ConfigService) => jwtModuleOptions(configService),
  inject: [ConfigService],
});
