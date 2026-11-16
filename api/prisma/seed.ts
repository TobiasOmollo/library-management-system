import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Librarian account from env vars with safe defaults
  const librarianEmail = process.env.SEED_LIBRARIAN_EMAIL || 'librarian@example.com';
  const librarianPassword = process.env.SEED_LIBRARIAN_PASSWORD || 'Librarian123!';
  const hashedPassword = await bcrypt.hash(librarianPassword, 10);

  const librarian = await prisma.user.upsert({
    where: { email: librarianEmail },
    update: {
      passwordHash: hashedPassword,
      role: 'LIBRARIAN',
    },
    create: {
      email: librarianEmail,
      name: 'System Librarian',
      passwordHash: hashedPassword,
      role: 'LIBRARIAN',
    },
  });
  console.log(`Librarian ready: ${librarian.email}`);

  // 2. Define Genres with sample books
  const genresData = [
    {
      name: 'Fiction',
      books: [
        {
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          isbn: '978-0743273565',
          description: 'A portrait of the Jazz Age in all its decadence.',
          publishedYear: 1925,
          copies: 5,
          available: 5,
        },
        {
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          isbn: '978-0061120084',
          description: 'A story of racial injustice and the destruction of innocence.',
          publishedYear: 1960,
          copies: 4,
          available: 4,
        },
        {
          title: '1984',
          author: 'George Orwell',
          isbn: '978-0451524935',
          description: 'A dystopian social science fiction novel and cautionary tale.',
          publishedYear: 1949,
          copies: 6,
          available: 6,
        },
      ],
    },
    {
      name: 'Science',
      books: [
        {
          title: 'A Brief History of Time',
          author: 'Stephen Hawking',
          isbn: '978-0553380163',
          description: 'From the Big Bang to Black Holes.',
          publishedYear: 1988,
          copies: 3,
          available: 3,
        },
        {
          title: 'Cosmos',
          author: 'Carl Sagan',
          isbn: '978-0345331359',
          description: 'The story of cosmic evolution and science.',
          publishedYear: 1980,
          copies: 4,
          available: 4,
        },
        {
          title: 'The Selfish Gene',
          author: 'Richard Dawkins',
          isbn: '978-0199291151',
          description: 'A gene-centric view of evolution.',
          publishedYear: 1976,
          copies: 3,
          available: 3,
        },
      ],
    },
    {
      name: 'History',
      books: [
        {
          title: 'Sapiens: A Brief History of Humankind',
          author: 'Yuval Noah Harari',
          isbn: '978-0062316097',
          description: 'Surveys the history of humankind from the Stone Age up to the twenty-first century.',
          publishedYear: 2014,
          copies: 5,
          available: 5,
        },
        {
          title: 'Guns, Germs, and Steel',
          author: 'Jared Diamond',
          isbn: '978-0393317558',
          description: 'The fates of human societies.',
          publishedYear: 1997,
          copies: 3,
          available: 3,
        },
      ],
    },
    {
      name: 'Fantasy',
      books: [
        {
          title: 'The Hobbit',
          author: 'J.R.R. Tolkien',
          isbn: '978-0547928227',
          description: 'The classic prelude to The Lord of the Rings.',
          publishedYear: 1937,
          copies: 4,
          available: 4,
        },
      ],
    },
  ];

  // 3. Upsert each Genre and its Books
  for (const genreData of genresData) {
    const genre = await prisma.genre.upsert({
      where: { name: genreData.name },
      update: {},
      create: { name: genreData.name },
    });

    console.log(`Genre ready: ${genre.name}`);

    for (const book of genreData.books) {
      await prisma.book.upsert({
        where: { isbn: book.isbn },
        update: {
          title: book.title,
          author: book.author,
          genreId: genre.id,
          description: book.description,
          publishedYear: book.publishedYear,
          copies: book.copies,
          available: book.available,
        },
        create: {
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          description: book.description,
          publishedYear: book.publishedYear,
          copies: book.copies,
          available: book.available,
          genreId: genre.id,
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
