import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Request,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { TUser, TUserRequest } from 'src/types/type';
import { Wish } from '../wishes/entities/wish.entity';
import { FindUserDto } from './dto/find-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  findOwn(@Request() { user }: TUserRequest): Promise<TUser> {
    return this.usersService.findOneById(user.id);
  }

  @Patch('me')
  update(
    @Request() { user }: TUserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<TUser> {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Get('me/wishes')
  getOwnWishes(@Request() { user }: TUserRequest): Promise<Wish[]> {
    return this.usersService.getWishes(user.username);
  }

  @Get(':username')
  async getOne(@Param('username') username: string): Promise<TUser> {
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }
    return user;
  }

  @Get(':username/wishes')
  async getWishes(@Param('username') username: string): Promise<Wish[]> {
    return this.usersService.getWishes(username);
  }

  @Post('find')
  async findMany(@Body() findUserDto: FindUserDto): Promise<TUser[]> {
    return this.usersService.find(findUserDto);
  }
}
