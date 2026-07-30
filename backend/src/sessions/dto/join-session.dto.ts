import { IsNotEmpty, IsString } from 'class-validator';

export class JoinSessionDto {
    @IsString()
    @IsNotEmpty({ message: 'nickname é obrigatório' })
    nickname: string;
}
