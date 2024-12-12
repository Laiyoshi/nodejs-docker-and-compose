import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { TUser } from 'src/types/type';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { HashService } from 'src/modules/hash/hash.service';
import { FindUserDto } from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Wish } from 'src/modules/wishes/entities/wish.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
  ) {}

  find(findUserDto: FindUserDto): Promise<User[]> {
    return this.userRepository.find({
      where: [
        { username: Like(`%${findUserDto.query}`) },
        { email: Like(`%${findUserDto.query}`) },
      ],
    });
  }

  findOne(searchId: string): Promise<User> {
    return this.userRepository.findOne({
      where: [{ email: searchId }, { username: searchId }],
    });
  }

  async findOneById(id: number): Promise<TUser> {
    //eslint-disable-next-line
    const { password, ...user } = await this.userRepository.findOne({
      where: { id },
    });
    return user;
  }

  async existUser(username: string, email: string): Promise<boolean> {
    const existUsername = await this.userRepository.findOne({
      where: { username },
    });
    const existEmail = await this.userRepository.findOne({ where: { email } });

    if (existUsername || existEmail) return true;

    return false;
  }

  async save(createUserDto: CreateUserDto): Promise<TUser> {
    const existUser = await this.existUser(
      createUserDto.username,
      createUserDto.email,
    );

    if (existUser) {
      throw new BadRequestException(
        'Пользователь с таким email или паролем уже создан',
      );
    }
    //eslint-disable-next-line
    const { password, ...user } = await this.userRepository.save({
      username: createUserDto.username,
      about: createUserDto.about,
      avatar: createUserDto.avatar,
      email: createUserDto.email,
      password: this.hashService.getHash(createUserDto.password),
    });

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<TUser> {
    const user = await this.findOneById(id);

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const isUsernameExist = await this.findOne(updateUserDto.username);
      if (isUsernameExist) {
        throw new BadRequestException(
          'Пользователь с таким именем уже зарегистрирован',
        );
      }
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const isEmailExist = await this.findOne(updateUserDto.email);
      if (isEmailExist) {
        throw new BadRequestException(
          'Пользователь с таким email уже зарегистрирован',
        );
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = this.hashService.getHash(updateUserDto.password);
    }

    await this.userRepository.update(id, updateUserDto);

    return this.findOneById(id);
  }

  async getWishes(username: string): Promise<Wish[]> {
    const user = await this.findOne(username);

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    const { wishes } = await this.userRepository.findOne({
      where: { username },
      select: ['wishes'],
      relations: ['wishes', 'wishes.owner', 'wishes.offers'],
    });

    return wishes;
  }
}
