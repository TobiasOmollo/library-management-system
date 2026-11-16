import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString({ message: 'Author must be a string' })
  @IsNotEmpty({ message: 'Author is required' })
  author: string;

  @IsOptional()
  @IsString({ message: 'ISBN must be a string' })
  isbn?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'publishedYear must be an integer' })
  @Min(0, { message: 'publishedYear cannot be negative' })
  publishedYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'copies must be an integer' })
  @Min(0, { message: 'copies cannot be negative' })
  copies?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'available must be an integer' })
  @Min(0, { message: 'available cannot be negative' })
  available?: number;

  @IsUUID('4', { message: 'genreId must be a valid UUID' })
  @IsNotEmpty({ message: 'genreId is required' })
  genreId: string;
}

