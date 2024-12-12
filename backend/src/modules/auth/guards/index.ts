import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

export const guards = [LocalAuthGuard, JwtAuthGuard];
