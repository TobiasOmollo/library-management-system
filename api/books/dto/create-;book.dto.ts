import { IsString, IsInt, IsOptional, Min } from "class-validator";

export class CreateBookDto {
    @IsString() title: string;
    @IsString() author: string;
    @IsString() @isbn: string;
    @IsOptional() @IsString() coverImage?: string;
    @IsInt() @Min(1) totalCopies: number;
    @IsInt() genreId: number;
}

app.useGlobalPipes(new ValidationPipe({ whitelist: true }));