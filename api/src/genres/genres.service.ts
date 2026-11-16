import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.genre.findMany({
      include: {
        _count: {
          select: { books: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: {
        books: true,
      },
    });

    if (!genre) {
      throw new NotFoundException(`Genre with ID "${id}" not found`);
    }

    return genre;
  }

  async create(dto: CreateGenreDto) {
    const existing = await this.prisma.genre.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Genre "${dto.name}" already exists`);
    }

    return this.prisma.genre.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateGenreDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.genre.findUnique({
        where: { name: dto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(`Genre "${dto.name}" already exists`);
      }
    }

    return this.prisma.genre.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const bookCount = await this.prisma.book.count({
      where: { genreId: id },
    });

    if (bookCount > 0) {
      throw new ConflictException(
        `Cannot delete genre because it still has ${bookCount} associated book(s)`,
      );
    }

    return this.prisma.genre.delete({
      where: { id },
    });
  }
}

