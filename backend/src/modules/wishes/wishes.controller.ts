import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TUserRequest } from 'src/types/type';
import { Wish } from './entities/wish.entity';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Request() { user }: TUserRequest,
    @Body() createWishDto: CreateWishDto,
  ): Promise<Wish> {
    return this.wishesService.create(user.id, createWishDto);
  }

  @Get('last')
  findLast(): Promise<Wish[]> {
    return this.wishesService.findLast();
  }

  @Get('top')
  findTop(): Promise<Wish[]> {
    return this.wishesService.findTop();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Wish> {
    return this.wishesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() createWishDto: CreateWishDto,
    @Request() { user }: TUserRequest,
  ): Promise<Wish> {
    return this.wishesService.update(id, createWishDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  removeOne(
    @Param('id') id: number,
    @Request() { user }: TUserRequest,
  ): Promise<Wish> {
    return this.wishesService.remove(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  copy(
    @Param('id') id: number,
    @Request() { user }: TUserRequest,
  ): Promise<Wish> {
    return this.wishesService.copy(id, user);
  }
}
