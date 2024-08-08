import { IsString, IsNotEmpty, IsDate, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class KpiDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsNumber()
  @IsNotEmpty()
  readonly target: number;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  readonly startDate: Date;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  readonly endDate: Date;

  readonly timeUnit?: number;
}