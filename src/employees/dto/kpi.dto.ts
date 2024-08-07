import { IsString, IsNotEmpty, IsDate, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class KpiDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsNumber()
  @IsNotEmpty()
  readonly target: number;

  @IsNumber()
  @IsNotEmpty()
  readonly timeUnit: number;
}