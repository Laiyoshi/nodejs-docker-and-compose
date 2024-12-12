import { User } from 'src/modules/users/entities/user.entity';

export type TUserRequest = {
  user: {
    id: number;
    username: string;
  };
};

export type TToken = { access_token: string };

export type TUser = Omit<User, 'password'>;
