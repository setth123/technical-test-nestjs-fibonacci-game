import { IsString, Length, Matches } from 'class-validator';

export class CredentialsDto {
  @IsString()
  @Length(3, 20)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'username chỉ gồm chữ, số và _' })
  username: string;

  @IsString()
  @Length(6, 50)
  password: string;
}
