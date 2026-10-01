import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

// 1. Update state definition
code = code.replace(
  "const [delivery, setDelivery] = useState({ userId: params.get('userId') || 'all', status: 'all', dateRange: { from: '', to: '' } })",
  "const [delivery, setDelivery] = useState({ userId: params.get('userId') || 'all', status: 'all', dateRange: { from: '', to: '' }, sender: '', mobile: '' })"
);

// 2. Update filtering logic
const oldDeliveryRows = `const deliveryRows = useMemo(() => {
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

const newDeliveryRows = `const deliveryRows = useMemo(() => {
    return messages.filter((m) => {
      if (delivery.userId !== 'all' && m.userId !== delivery.userId) return false
      if (delivery.status !== 'all' && m.status !== delivery.status) return false
      if (delivery.sender && !m.from?.toLowerCase().includes(delivery.sender.toLowerCase())) return false
      if (delivery.mobile && !m.to?.includes(delivery.mobile)) return false
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

code = code.replace(oldDeliveryRows, newDeliveryRows);

// 3. Update the UI
const oldDeliveryUI = `{tab === 'Delivery Report' && <Card><div className="mb-4 flex flex-wrap gap-3">{isStaff && <select className={\`\${inputCls} sm:max-w-[280px]\`} value={delivery.userId} onChange={(e) => setDelivery({ ...delivery, userId: e.target.value })}><option value="all">All users</option>{users.map((u) => <option key={u.id} value={u.id}>{u.companyName}</option>)}</select>}<select className={\`\${inputCls} sm:max-w-[220px]\`} value={delivery.status} onChange={(e) => setDelivery({ ...delivery, status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All delivery statuses' : s}</option>)}</select><DateRangePicker value={delivery.dateRange} onChange={(r) => setDelivery({ ...delivery, dateRange: r })} /><Button variant="secondary" className="sm:ml-auto" onClick={() => exportRows(deliveryRows, 'delivery-report')}><DownloadIcon className="h-[18px] w-[18px]" /> Export</Button></div><MessageTable rows={deliveryRows} /></Card>}`;

const newDeliveryUI = `{tab === 'Delivery Report' && <Card><div className="mb-4 flex flex-wrap gap-3">{isStaff && <select className={\`\${inputCls} sm:max-w-[280px]\`} value={delivery.userId} onChange={(e) => setDelivery({ ...delivery, userId: e.target.value })}><option value="all">All users</option>{users.map((u) => <option key={u.id} value={u.id}>{u.companyName}</option>)}</select>}<select className={\`\${inputCls} sm:max-w-[220px]\`} value={delivery.status} onChange={(e) => setDelivery({ ...delivery, status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All delivery statuses' : s}</option>)}</select><input className={\`\${inputCls} sm:max-w-[200px]\`} placeholder="Sender ID" value={delivery.sender} onChange={(e) => setDelivery({ ...delivery, sender: e.target.value })} /><input className={\`\${inputCls} sm:max-w-[200px]\`} placeholder="Mobile number" value={delivery.mobile} onChange={(e) => setDelivery({ ...delivery, mobile: e.target.value })} /><DateRangePicker value={delivery.dateRange} onChange={(r) => setDelivery({ ...delivery, dateRange: r })} /><Button variant="secondary" className="sm:ml-auto" onClick={() => exportRows(deliveryRows, 'delivery-report')}><DownloadIcon className="h-[18px] w-[18px]" /> Export</Button></div><MessageTable rows={deliveryRows} /></Card>}`;

if (code.includes(oldDeliveryUI)) {
  code = code.replace(oldDeliveryUI, newDeliveryUI);
  fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
  console.log('Success UI replaced');
} else {
  // If the regex is slightly off, we use regex
  const regexDeliveryUI = /\{tab === 'Delivery Report' && <Card><div className="mb-4 flex flex-wrap gap-3">[\s\S]*?<MessageTable rows=\{deliveryRows\} \/><\/Card>\}/;
  if (regexDeliveryUI.test(code)) {
    code = code.replace(regexDeliveryUI, newDeliveryUI);
    fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
    console.log('Success UI regex replaced');
  } else {
    console.log('Failed UI bounds');
  }
}
