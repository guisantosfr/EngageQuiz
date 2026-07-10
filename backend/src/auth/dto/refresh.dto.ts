import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  @IsNotEmpty({ message: 'O refresh token é obrigatório' })
  refreshToken: string;
}
