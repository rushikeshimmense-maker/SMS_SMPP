const fs = require('fs');
let path = 'src/pages/Reports.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update initial state
content = content.replace(
  "const [delivery, setDelivery] = useState({ userId: params.get('userId') || 'all', status: 'all' })",
  "const [delivery, setDelivery] = useState({ userId: params.get('userId') || 'all', status: 'all', date: '' })"
);

// 2. Update deliveryRows useMemo
const oldMemo = `  const deliveryRows = useMemo(() => {
    return messages.filter((m) => {
      if (delivery.userId !== 'all' && m.userId !== delivery.userId) return false
      if (delivery.status !== 'all' && m.status !== delivery.status) return false
      return true
    })
  }, [messages, delivery])`;

const newMemo = `  const deliveryRows = useMemo(() => {
    return messages.filter((m) => {
      if (delivery.userId !== 'all' && m.userId !== delivery.userId) return false
      if (delivery.status !== 'all' && m.status !== delivery.status) return false
      if (delivery.date) {
        const t = m.submittedAt || m.createdAt;
        if (!t || !t.startsWith(delivery.date)) return false;
      }
      return true
    })
  }, [messages, delivery])`;

content = content.replace(oldMemo, newMemo);

// 3. Update the Delivery Report tab to add the date input
const oldTab = `<select className={\`\${inputCls} sm:max-w-[220px]\`} value={delivery.status} onChange={(e) => setDelivery({ ...delivery, status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All delivery statuses' : s}</option>)}</select>`;

const newTab = `<select className={\`\${inputCls} sm:max-w-[220px]\`} value={delivery.status} onChange={(e) => setDelivery({ ...delivery, status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All delivery statuses' : s}</option>)}</select><input type="date" aria-label="Select Date" className={\`\${inputCls} sm:max-w-[170px] text-gray-500\`} value={delivery.date} onChange={(e) => setDelivery({ ...delivery, date: e.target.value })} />`;

content = content.replace(oldTab, newTab);

// 4. Also fix MessageTable if it's strictly using createdAt so it falls back to submittedAt
content = content.replace(
  "fmtTime(r.createdAt)",
  "fmtTime(r.createdAt || r.submittedAt)"
);

fs.writeFileSync(path, content);
console.log('Success');
