import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

const regexDeliveryUI = /\{tab === 'Delivery Report' && <Card><div className="mb-4 flex flex-wrap gap-3">[\s\S]*?<MessageTable rows=\{deliveryRows\} \/><\/Card>\}/;

const newDeliveryUI = `{tab === 'Delivery Report' && <Card>
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {isStaff && <select className={\`\${inputCls} sm:max-w-[200px]\`} value={delivery.userId} onChange={(e) => setDelivery({ ...delivery, userId: e.target.value })}><option value="all">All users</option>{users.map((u) => <option key={u.id} value={u.id}>{u.companyName}</option>)}</select>}
            <select className={\`\${inputCls} sm:max-w-[180px]\`} value={delivery.status} onChange={(e) => setDelivery({ ...delivery, status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All delivery statuses' : s}</option>)}</select>
            <DateRangePicker value={delivery.dateRange} onChange={(r) => setDelivery({ ...delivery, dateRange: r })} />
            <Button variant="secondary" className="sm:ml-auto" onClick={() => exportRows(deliveryRows, 'delivery-report')}><DownloadIcon className="h-[18px] w-[18px]" /> Export</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-[16px] w-[16px]"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <input className={\`\${inputCls} pl-[38px] sm:w-[240px]\`} placeholder="Search by Sender ID..." value={delivery.sender} onChange={(e) => setDelivery({ ...delivery, sender: e.target.value })} />
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-[16px] w-[16px]"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <input className={\`\${inputCls} pl-[38px] sm:w-[240px]\`} placeholder="Search by Mobile..." value={delivery.mobile} onChange={(e) => setDelivery({ ...delivery, mobile: e.target.value })} />
            </div>
          </div>
        </div>
        <MessageTable rows={deliveryRows} />
      </Card>}`;

if (regexDeliveryUI.test(code)) {
  code = code.replace(regexDeliveryUI, newDeliveryUI);
  fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
  console.log('Success UI formatted');
} else {
  console.log('Failed UI format bounds');
}
