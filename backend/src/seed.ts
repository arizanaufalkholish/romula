import prisma from './config/db';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding ROMULA database...');

  // Create demo user
  const password = await bcrypt.hash('romula123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@romula.app' },
    update: {},
    create: { email: 'demo@romula.app', name: 'Researcher', password },
  });
  const uid = user.id;

  // Tags
  const tagNames = [
    { name: 'JavaScript', color: '#f7df1e' }, { name: 'Python', color: '#3776ab' },
    { name: 'Machine Learning', color: '#ff6f00' }, { name: 'Database', color: '#336791' },
    { name: 'Web Dev', color: '#61dafb' }, { name: 'Penting', color: '#ef4444' },
    { name: 'Tutorial', color: '#10b981' }, { name: 'Sains', color: '#8b5cf6' },
  ];
  for (const t of tagNames) {
    await prisma.tag.upsert({ where: { userId_name: { userId: uid, name: t.name } }, update: {}, create: { userId: uid, ...t } });
  }

  // Notes
  await prisma.noteItem.createMany({ data: [
    { userId: uid, title: 'Pengenalan Machine Learning', content: '## Apa itu Machine Learning?\n\nMachine Learning adalah cabang AI yang memungkinkan komputer belajar dari data.\n\n### Jenis ML:\n- **Supervised Learning** — Belajar dari data berlabel\n- **Unsupervised Learning** — Menemukan pola tanpa label\n- **Reinforcement Learning** — Belajar melalui reward\n\nContoh: rekomendasi Netflix, deteksi spam, self-driving cars.', summary: 'Pengenalan dasar ML dan jenis-jenisnya', category: 'education' },
    { userId: uid, title: 'Stack & Queue', content: '## Stack\nLIFO — Last In First Out. Operasi: push, pop, peek.\n\n## Queue\nFIFO — First In First Out. Operasi: enqueue, dequeue, front.\n\nKeduanya fundamental dalam algoritma.', summary: 'Struktur data Stack dan Queue', category: 'education' },
  ]});

  // Code Snippets
  await prisma.codeSnippet.createMany({ data: [
    { userId: uid, name: 'Fetch API', code: 'async function fetchData(url) {\n  const res = await fetch(url);\n  const data = await res.json();\n  return data;\n}', language: 'javascript', description: 'Contoh Fetch API' },
    { userId: uid, name: 'List Comprehension', code: 'squares = [x**2 for x in range(10)]\nevens = [x for x in range(20) if x % 2 == 0]\nprint(squares, evens)', language: 'python', description: 'Python list comprehension' },
  ]});

  // SQL
  await prisma.sqlItem.createMany({ data: [
    { userId: uid, name: 'JOIN Query', query: 'SELECT u.name, o.total\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nWHERE o.total > 100000\nORDER BY o.date DESC;', description: 'Contoh query JOIN' },
  ]});

  // News
  await prisma.newsItem.createMany({ data: [
    { userId: uid, title: 'OpenAI Merilis GPT-5', content: 'Model GPT-5 dengan kemampuan reasoning lebih kuat dan multimodal capabilities.', category: 'tech', source: 'TechCrunch' },
    { userId: uid, title: 'Startup Indonesia Tumbuh 40%', content: 'Ekosistem startup Indonesia didorong adopsi AI dan digitalisasi UMKM.', category: 'business', source: 'Bloomberg' },
  ]});

  // People
  await prisma.personItem.createMany({ data: [
    { userId: uid, name: 'Dr. Ahmad Rizki', email: 'ahmad@univ.ac.id', phone: '+628123456789', org: 'Universitas Indonesia', role: 'Dosen', notes: 'Ahli Machine Learning' },
  ]});

  // Finance
  const today = new Date().toISOString().split('T')[0];
  const ym = today.slice(0, 8);
  await prisma.financeRecord.createMany({ data: [
    { userId: uid, type: 'income', description: 'Gaji', amount: 5000000, category: 'salary', date: `${ym}01` },
    { userId: uid, type: 'income', description: 'Freelance', amount: 2500000, category: 'freelance', date: `${ym}05` },
    { userId: uid, type: 'expense', description: 'Buku', amount: 350000, category: 'education', date: `${ym}03` },
    { userId: uid, type: 'expense', description: 'Internet', amount: 500000, category: 'bills', date: `${ym}02` },
    { userId: uid, type: 'expense', description: 'Makan', amount: 45000, category: 'food', date: today },
  ]});

  // Tables
  await prisma.tableItem.create({
    data: { userId: uid, name: 'Jadwal Kuliah', columns: JSON.stringify(['Hari','Jam','Mata Kuliah','Ruang']),
      rows: JSON.stringify([{Hari:'Senin',Jam:'08:00','Mata Kuliah':'Algoritma',Ruang:'A-101'},{Hari:'Selasa',Jam:'10:00','Mata Kuliah':'Database',Ruang:'B-203'}]) },
  });

  // Activity logs
  await prisma.activityLog.createMany({ data: [
    { userId: uid, action: 'create', module: 'notes', detail: 'Pengenalan Machine Learning' },
    { userId: uid, action: 'create', module: 'code', detail: 'Fetch API' },
    { userId: uid, action: 'create', module: 'news', detail: 'OpenAI Merilis GPT-5' },
    { userId: uid, action: 'create', module: 'finance', detail: 'Gaji' },
  ]});

  console.log('✅ Seed complete!');
  console.log('   Login: demo@romula.app / romula123');
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
