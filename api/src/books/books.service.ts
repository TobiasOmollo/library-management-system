import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBooksDto } from './dto/query-books.dto';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryBooksDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 50) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { author: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    if (query.genreId) {
      where.genreId = query.genreId;
    } else if (query.genre) {
      where.genre = {
        name: { contains: query.genre, mode: 'insensitive' },
      };
    }

    const [total, data] = await Promise.all([
      this.prisma.book.count({ where }),
      this.prisma.book.findMany({
        where,
        include: { genre: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { genre: true },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID "${id}" not found`);
    }

    return book;
  }

  async create(dto: CreateBookDto) {
    // Verify genre exists
    const genre = await this.prisma.genre.findUnique({
      where: { id: dto.genreId },
    });
    if (!genre) {
      throw new NotFoundException(`Genre with ID "${dto.genreId}" not found`);
    }

    // Check duplicate ISBN
    if (dto.isbn) {
      const existingIsbn = await this.prisma.book.findUnique({
        where: { isbn: dto.isbn },
      });
      if (existingIsbn) {
        throw new ConflictException(`Book with ISBN "${dto.isbn}" already exists`);
      }
    }

    return this.prisma.book.create({
      data: dto,
      include: { genre: true },
    });
  }

  async update(id: string, dto: UpdateBookDto) {
    await this.findOne(id);

    if (dto.genreId) {
      const genre = await this.prisma.genre.findUnique({
        where: { id: dto.genreId },
      });
      if (!genre) {
        throw new NotFoundException(`Genre with ID "${dto.genreId}" not found`);
      }
    }

    if (dto.isbn) {
      const existingIsbn = await this.prisma.book.findUnique({
        where: { isbn: dto.isbn },
      });
      if (existingIsbn && existingIsbn.id !== id) {
        throw new ConflictException(`Book with ISBN "${dto.isbn}" already exists`);
      }
    }

    return this.prisma.book.update({
      where: { id },
      data: dto,
      include: { genre: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.book.delete({
      where: { id },
    });

    return { message: 'Book deleted successfully', id };
  }
}

