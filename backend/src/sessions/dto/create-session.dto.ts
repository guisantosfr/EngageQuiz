import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSessionDto {
    @IsString()
    @IsNotEmpty({ message: 'quizId é obrigatório' })
    quizId: string;
}
