import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitAnswerDto {
    @IsString()
    @IsNotEmpty({ message: 'playerId é obrigatório' })
    playerId: string;

    @IsOptional()
    @IsString()
    optionId?: string;
}
