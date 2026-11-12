import { Controller } from '@nestjs/common';

@Controller('books')
export class BooksController {
    constructor(private bookService: BookService){}

    @Get()
    findAll(@Query("genredId") genreId?: string, @Query("search") search?: string){
        return this.bookService.findAll(genreId, search);
    }

    @Get()
    findOne(@Param("id") id: string) {
        return this.booksService.findOne(Number(id));
    }

    @Post()
    create(@Body() dto: CreateBookDto) {
        return this.booksService.create(dto);
    }
}
