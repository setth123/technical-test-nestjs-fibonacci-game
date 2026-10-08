import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nickname?: string;
}
