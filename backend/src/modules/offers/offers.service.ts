import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/modules/users/users.service';
import { WishesService } from 'src/modules/wishes/wishes.service';
import { UpdateWishDto } from 'src/modules/wishes/dto/update-wish.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  async create(createOfferDto: CreateOfferDto, userId): Promise<Offer> {
    const user = await this.usersService.findOneById(userId);
    const wish = await this.wishesService.findOne(createOfferDto.itemId);
    const donation = Number(wish.raised) + createOfferDto.amount;

    if (user.id === wish.owner.id) {
      throw new BadRequestException(
        'Вы не можете внести средства на свои подарки.',
      );
    }

    if (donation > wish.price) {
      throw new BadRequestException(
        'Сумма вносимых средств превышает сумму подарка.',
      );
    }

    await this.wishesService.update(
      createOfferDto.itemId,
      {
        raised: donation,
      } as UpdateWishDto,
      user,
    );

    return this.offerRepository.save({ ...createOfferDto, user, item: wish });
  }

  async findAll(): Promise<Offer[]> {
    const offers = await this.offerRepository.find({
      relations: ['user', 'item'],
    });

    offers.forEach((offer) => delete offer.user.password);

    return offers;
  }

  findOne(id: number): Promise<Offer> {
    return this.offerRepository.findOne({ where: { id } });
  }
}
