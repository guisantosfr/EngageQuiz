import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RefreshDto {
  @IsString()
  @IsNotEmpty({ message: 'O refresh token é obrigatório' })
  @MaxLength(500, { message: 'O refresh token excedeu o tamanho máximo permitido' })
  refreshToken: string;
}
