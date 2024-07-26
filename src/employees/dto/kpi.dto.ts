import { IsString, IsNotEmpty, IsDate, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class KpiDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly target: string;

  @IsNumber()
  @IsNotEmpty()
  readonly timeUnit: number;
}