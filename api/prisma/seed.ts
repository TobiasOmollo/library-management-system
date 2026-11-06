import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing records to avoid unique constraint duplicates on re-runs
  await prisma.book.deleteMany();
  await prisma.genre.deleteMany();

  // 2. Define Genres with their corresponding Books
  const genresData = [
    {
      name: 'Science Fiction',
      books: [
        { title: 'Dune', author: 'Frank Herbert'},
        { title: 'Neuromancer', author: 'William Gibson'},
        { title: 'Foundation', author: 'Isaac Asimov' },
        { title: 'Snow Crash', author: 'Neal Stephenson' },
        { title: 'Hyperion', author: 'Dan Simmons' },
        { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin' },
      ],
    },
    {
      name: 'Fantasy',
      books: [
        { title: 'The Hobbit', author: 'J.R.R. Tolkien' },
        { title: 'The Name of the Wind', author: 'Patrick Rothfuss' },
        { title: 'A Game of Thrones', author: 'George R.R. Martin' },
        { title: 'The Way of Kings', author: 'Brandon Sanderson' },
        { title: 'The Lies of Locke Lamora', author: 'Scott Lynch' },
        { title: 'Assassin’s Apprentice', author: 'Robin Hobb' },
      ],
    },
    {
      name: 'Software Engineering',
      books: [
        { title: 'Clean Code', author: 'Robert C. Martin' },
        { title: 'Design Patterns: Elements of Reusable Object-Oriented Software', author: 'Gang of Four' },
        { title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas' },
        { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann' },
        { title: 'Refactoring: Improving the Design of Existing Code', author: 'Martin Fowler' },
        { title: 'Clean Architecture', author: 'Robert C. Martin' },
      ],
    },
    {
      name: 'Mystery & Thriller',
      books: [
        { title: 'The Da Vinci Code', author: 'Dan Brown' },
        { title: 'Gone Girl', author: 'Gillian Flynn' },
        { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson' },
        { title: 'And Then There Were None', author: 'Agatha Christie' },
        { title: 'The Silent Patient', author: 'Alex Michaelides' },
        { title: 'Big Little Lies', author: 'Liane Moriarty' },
      ],
    },
  ];

  // 3. Insert each Genre and its nested Books
  for (const genre of genresData) {
    const createdGenre = await prisma.genre.create({
      data: {
        name: genre.name,
        books: {
          create: genre.books,
        },
      },
      include: {
        books: true,
      },
    });

    console.log(`Created genre "${createdGenre.name}" with ${createdGenre.books.length} books.`);
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