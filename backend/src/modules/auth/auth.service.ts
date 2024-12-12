import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '../hash/hash.service';
import { SignUpDto } from './dto/sing-up.dto';
import { TToken, TUser } from 'src/types/type';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userService.findOne(username);

    if (!user || !this.hashService.compare(password, user.password)) {
      return null;
    }
    return user;
  }

  signup(signupDto: SignUpDto): Promise<TUser> {
    return this.userService.save(signupDto);
  }

  async signin(user: TUser): Promise<TToken> {
    const token = this.jwtService.sign({
      id: user.id,
      username: user.username,
    });

    return {
      access_token: token,
    };
  }
}
