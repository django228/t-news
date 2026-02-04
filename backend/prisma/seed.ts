import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123', 10);

  const seneca = await prisma.user.upsert({
    where: { username: 'Луций Анней Сенека' },
    update: { password: hashedPassword },
    create: {
      username: 'Луций Анней Сенека',
      password: hashedPassword,
      bio: 'Философ-стоик, государственный деятель, оратор и писатель Древнего Рима.',
      avatar: '/Master.svg',
    },
  });

  const marcus = await prisma.user.upsert({
    where: { username: 'Марк Аврелий' },
    update: { password: hashedPassword },
    create: {
      username: 'Марк Аврелий',
      password: hashedPassword,
      bio: 'Римский император и философ-стоик, автор "Размышлений".',
      avatar: '/Master.svg',
    },
  });

  const epictetus = await prisma.user.upsert({
    where: { username: 'Эпиктет' },
    update: { password: hashedPassword },
    create: {
      username: 'Эпиктет',
      password: hashedPassword,
      bio: 'Древнегреческий философ-стоик, бывший раб, ставший учителем мудрости.',
      avatar: '/Master.svg',
    },
  });

  const plato = await prisma.user.upsert({
    where: { username: 'Платон' },
    update: { password: hashedPassword },
    create: {
      username: 'Платон',
      password: hashedPassword,
      bio: 'Древнегреческий философ, ученик Сократа и учитель Аристотеля.',
      avatar: '/Master.svg',
    },
  });

  const aristotle = await prisma.user.upsert({
    where: { username: 'Аристотель' },
    update: { password: hashedPassword },
    create: {
      username: 'Аристотель',
      password: hashedPassword,
      bio: 'Древнегреческий философ, ученик Платона, основатель перипатетической школы.',
      avatar: '/Master.svg',
    },
  });

  const allPosts = [
    {
      content: 'Время, которое мы имеем, — это не наше время. Оно дано нам взаймы, и мы должны вернуть его с процентами.',
      userId: seneca.id,
    },
    {
      content: 'Не потому человек мало живет, что мало живет, а потому, что много времени тратит впустую.',
      userId: seneca.id,
    },
    {
      content: 'Пока мы откладываем жизнь, она проходит.',
      userId: seneca.id,
    },
    {
      content: 'Счастье заключается не в обладании желаемым, а в том, чтобы желать то, что имеешь.',
      userId: seneca.id,
    },
    {
      content: 'Трудности укрепляют ум, как труд укрепляет тело.',
      userId: seneca.id,
    },
    {
      content: 'Живи так, как будто сегодня последний день твоей жизни.',
      userId: marcus.id,
    },
    {
      content: 'Не живи так, как будто тебе осталось жить десять тысяч лет. Смерть стоит у твоих ворот.',
      userId: marcus.id,
    },
    {
      content: 'Ты имеешь власть над своим разумом, а не над внешними событиями. Пойми это, и ты обретешь силу.',
      userId: marcus.id,
    },
    {
      content: 'Не беспокойся о том, что другие думают о тебе. Думай о том, что ты думаешь о себе.',
      userId: marcus.id,
    },
    {
      content: 'Люди существуют друг для друга. Учи их или терпи их.',
      userId: marcus.id,
    },
    {
      content: 'Не стремись к тому, чтобы события происходили так, как ты хочешь, а желай, чтобы они происходили так, как происходят.',
      userId: epictetus.id,
    },
    {
      content: 'Свобода — это не получение того, чего ты хочешь, а желание того, что у тебя есть.',
      userId: epictetus.id,
    },
    {
      content: 'Только образованный свободен.',
      userId: epictetus.id,
    },
    {
      content: 'Несчастье и счастье зависят от нас самих.',
      userId: epictetus.id,
    },
    {
      content: 'Познай самого себя.',
      userId: plato.id,
    },
    {
      content: 'Идеи правят миром.',
      userId: plato.id,
    },
    {
      content: 'Философия начинается с удивления.',
      userId: plato.id,
    },
    {
      content: 'Мужество — это знать, чего не следует бояться.',
      userId: plato.id,
    },
    {
      content: 'Мы то, что мы делаем постоянно. Совершенство, следовательно, не действие, а привычка.',
      userId: aristotle.id,
    },
    {
      content: 'Счастье зависит от нас самих.',
      userId: aristotle.id,
    },
    {
      content: 'Природа не терпит пустоты.',
      userId: aristotle.id,
    },
    {
      content: 'Знание — это сила.',
      userId: aristotle.id,
    },
  ];

  await prisma.post.deleteMany({});

  for (const post of allPosts) {
    await prisma.post.create({
      data: post,
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

