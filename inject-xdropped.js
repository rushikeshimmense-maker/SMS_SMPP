import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'backend', 'src', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// users available
const users = db.users.filter(u => u.role === 'user' || u.role === 'reseller');

// we want to add a bunch of dropped messages for the last 5 days
const statuses = ['dropped'];
const senders = ['SHOPEZ', 'INFO', 'ALERTS', 'OFFERS'];

const generateId = () => 'msg_' + Math.random().toString(36).substr(2, 9);
const generateDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(Math.floor(Math.random() * 24));
  d.setMinutes(Math.floor(Math.random() * 60));
  return d.toISOString();
};

for (let i = 0; i < 30; i++) { // Generate 30 dummy dropped messages
  const daysAgo = Math.floor(Math.random() * 5); // 0 to 4 days ago
  const user = users[Math.floor(Math.random() * users.length)];
  const sender = senders[Math.floor(Math.random() * senders.length)];
  const date = generateDate(daysAgo);

  db.messages.unshift({
    id: generateId(),
    userId: user.id,
    from: sender,
    to: '+919' + Math.floor(100000000 + Math.random() * 900000000),
    status: 'dropped',
    submittedAt: date,
    createdAt: date
  });
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Added 30 dummy dropped messages to db.json');
