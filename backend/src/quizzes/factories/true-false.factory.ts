import { BadRequestException } from '@nestjs/common';
import { CreateOptionDto } from '../dto';

export function createTrueFalseAlternatives(
    correctValue: boolean,
): CreateOptionDto[] {
    if (typeof correctValue !== 'boolean') {
        throw new BadRequestException(
            'Questões TRUE_FALSE precisam informar o valor correto (true ou false)',
        );
    }

    return [
        {
            text: 'Verdadeiro',
            isCorrect: correctValue === true,
        },
        {
            text: 'Falso',
            isCorrect: correctValue === false,
        },
    ];
}
