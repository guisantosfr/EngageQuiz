import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOptionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsBoolean()
  isCorrect: boolean;
}
