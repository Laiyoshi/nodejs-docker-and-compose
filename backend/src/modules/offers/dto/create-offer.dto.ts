import { IsBoolean, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  itemId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsBoolean()
  @IsOptional()
  hidden: boolean;
}
