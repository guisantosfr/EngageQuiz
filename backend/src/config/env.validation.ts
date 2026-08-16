import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength, validateSync } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty({ message: 'A variável DATABASE_URL é obrigatória' })
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty({ message: 'A variável ACCESS_TOKEN_SECRET é obrigatória' })
  @MinLength(16, { message: 'ACCESS_TOKEN_SECRET deve ter no mínimo 16 caracteres' })
  ACCESS_TOKEN_SECRET: string;

  @IsString()
  @IsNotEmpty({ message: 'A variável REFRESH_TOKEN_SECRET é obrigatória' })
  @MinLength(16, { message: 'REFRESH_TOKEN_SECRET deve ter no mínimo 16 caracteres' })
  REFRESH_TOKEN_SECRET: string;

  @IsString()
  @IsOptional()
  FRONTEND_URL?: string;

  @IsString()
  @IsOptional()
  GEMINI_API_KEY?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true }
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Erro na validação das variáveis de ambiente:\n${errors.toString()}`);
  }
  return validatedConfig;
}
