const fs = require('fs');
let path = 'src/pages/Reports.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('DateRangePicker')) {
  content = content.replace(
    "import { Button, Card, Chip, EmptyRow, inputCls, Table, Td } from '../components/ui.jsx'",
    "import { Button, Card, Chip, EmptyRow, inputCls, Table, Td } from '../components/ui.jsx'\nimport DateRangePicker from '../components/DateRangePicker.jsx'"
  );
}

// 1. Update initial state
content = content.replace(
  "const [delivery, setDelivery] = useState({ userId: params.get('userId') || 'all', status: 'all', date: '' })",
  "const [delivery, setDelivery] = useState({ userId: params.get('userId') || 'all', status: 'all', dateRange: { from: '', to: '' } })"
);

// 2. Update useMemo
const oldMemo = `  const deliveryRows = useMemo(() => {
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

const newMemo = `  const deliveryRows = useMemo(() => {
    return messages.filter((m) => {
      if (delivery.userId !== 'all' && m.userId !== delivery.userId) return false
      if (delivery.status !== 'all' && m.status !== delivery.status) return false
      if (delivery.dateRange?.from || delivery.dateRange?.to) {
        const t = m.submittedAt || m.createdAt;
        if (!t) return false;
        const d = t.split('T')[0];
        if (delivery.dateRange.from && d < delivery.dateRange.from) return false;
        if (delivery.dateRange.to && d > delivery.dateRange.to) return false;
      }
      return true
    })
  }, [messages, delivery])`;
content = content.replace(oldMemo, newMemo);

// 3. Update the tab rendering
const oldInput = `<input type="date" aria-label="Select Date" className={\`\${inputCls} sm:max-w-[170px] text-gray-500\`} value={delivery.date} onChange={(e) => setDelivery({ ...delivery, date: e.target.value })} />`;
const newInput = `<DateRangePicker value={delivery.dateRange} onChange={(r) => setDelivery({ ...delivery, dateRange: r })} />`;
content = content.replace(oldInput, newInput);

fs.writeFileSync(path, content);
console.log('Success');
