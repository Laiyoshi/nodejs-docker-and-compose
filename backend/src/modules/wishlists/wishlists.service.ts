import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/modules/users/users.service';
import { WishesService } from 'src/modules/wishes/wishes.service';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  async create(
    id: number,
    createWishlistDto: CreateWishlistDto,
  ): Promise<Wishlist> {
    const user = await this.usersService.findOneById(id);
    const wishes = await this.wishesService.findMany(createWishlistDto.itemsId);

    return this.wishlistRepository.save({
      ...createWishlistDto,
      owner: user,
      items: wishes,
    });
  }

  findAll(): Promise<Wishlist[]> {
    return this.wishlistRepository.find({ relations: ['owner', 'items'] });
  }

  async findOne(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });

    if (!wishlist) {
      throw new BadRequestException('Список не найден');
    }

    return wishlist;
  }

  async update(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId,
  ): Promise<Wishlist> {
    const wishlist = await this.findOne(id);

    if (wishlist.owner.id !== userId) {
      throw new BadRequestException(
        'Вы не можете изменить список другого пользователя',
      );
    }

    if (updateWishlistDto.itemsId) {
      const { itemsId, ...restDto } = updateWishlistDto;
      const wishes = await this.wishesService.findMany(itemsId);
      wishlist.items.push(...wishes);
      await this.wishlistRepository.save(wishlist);
      await this.wishlistRepository.update(id, restDto);
    } else {
      await this.wishlistRepository.update(id, updateWishlistDto);
    }

    return wishlist;
  }

  async removeOne(id: number, userId: number): Promise<Wishlist> {
    const wishlist = await this.findOne(id);
    if (wishlist.owner.id !== userId) {
      throw new BadRequestException(
        'Вы не можете удалить список другого пользователя',
      );
    }
    await this.wishlistRepository.delete(id);
    return wishlist;
  }
}
