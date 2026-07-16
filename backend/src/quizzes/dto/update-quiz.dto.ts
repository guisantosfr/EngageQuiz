import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../../generated/prisma/client';
import { UpdateOptionDto } from './update-option.dto';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  id?: string; // se existir, atualiza; se não, cria
  
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsInt()
  @Min(5)
  timeLimit: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOptionDto)
  options?: UpdateOptionDto[];

  @IsOptional()
  @IsBoolean()
  correctAnswer?: boolean; // só usado para questões true_false
}

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionDto)
  questions?: UpdateQuestionDto[];
}
