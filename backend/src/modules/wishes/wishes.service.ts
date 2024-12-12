import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { In, Repository } from 'typeorm';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private readonly wishRepository: Repository<Wish>,
    private readonly userService: UsersService,
  ) {}

  async create(id: number, createWishDto: CreateWishDto): Promise<Wish> {
    const user = await this.userService.findOneById(id);
    return this.wishRepository.save({
      ...createWishDto,
      owner: user,
    });
  }

  findLast(): Promise<Wish[]> {
    return this.wishRepository.find({
      order: { createdAt: 'DESC' },
      take: 40,
      relations: ['owner', 'offers'],
    });
  }

  findTop(): Promise<Wish[]> {
    return this.wishRepository.find({
      order: { copied: 'DESC' },
      take: 10,
      relations: ['owner', 'offers'],
    });
  }

  findOne(id: number): Promise<Wish> {
    const wish = this.wishRepository.findOne({
      where: { id },
      relations: ['owner', 'offers', 'offers.user'],
    });

    if (!wish) {
      throw new BadRequestException('Не найдено');
    }

    return wish;
  }

  async update(
    id: number,
    updateWishDto: UpdateWishDto,
    user: { id: number },
  ): Promise<Wish> {
    const wish = await this.findOne(id);

    if (updateWishDto.price && wish.offers.length > 0) {
      throw new BadRequestException('Невозможно изменить цену');
    }

    if (wish.owner.id !== user.id) {
      throw new BadRequestException('Вы не можете обновить чужой подарок');
    }

    await this.wishRepository.update(id, updateWishDto);
    return this.findOne(id);
  }

  async remove(id: number, user: { id: number }): Promise<Wish> {
    const wish = await this.findOne(id);

    if (user && wish.owner.id !== user.id) {
      throw new BadRequestException('Не найдено');
    }

    if (wish.offers.length > 0) {
      throw new BadRequestException(
        'Вы не можете удалить вещь, на которую уже начали собирать средства',
      );
    }

    await this.wishRepository.delete(id);

    return wish;
  }

  async copy(wishId: number, user): Promise<Wish> {
    //eslint-disable-next-line
    const { id, createdAt, updatedAt, copied, raised, offers, ...dataWish } =
      await this.findOne(wishId);
    const owner = await this.userService.findOneById(user.id);
    await this.wishRepository.update(id, { copied: copied + 1 });
    return this.wishRepository.save({
      ...dataWish,
      owner,
    });
  }

  findMany(id: number[]): Promise<Wish[]> {
    return this.wishRepository.find({
      where: { id: In(id) },
    });
  }
}
