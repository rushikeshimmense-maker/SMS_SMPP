import re

with open('frontend/src/pages/SendSms.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace states
c = re.sub(r'const \[isDynamic, setIsDynamic\] = useState\(false\)\s*const \[isSmart, setIsSmart\] = useState\(false\)', 
           \"const [mode, setMode] = useState('standard')\\n  const isDynamic = mode === 'dynamic'\\n  const isSmart = mode === 'smart'\\n  const isStandard = mode === 'standard'\", c)

# Remove Pill Toggle component
c = re.sub(r'/\* \? Pill Toggle \? \*/.*?function PillToggle.*?\}\n', '', c, flags=re.DOTALL)

# Remove Feature Pills div
c = re.sub(r'\{/\* Feature Pills \*/\}.*?</PillToggle>\s*</div>', '', c, flags=re.DOTALL)

# Insert Mode Tabs
tabs = '''
          {/* 3 Main Modes */}
          <div className=\"flex bg-gray-100 p-1 rounded-xl w-fit mt-4 sm:mt-0\">
            {['standard', 'dynamic', 'smart'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={px-6 py-2 rounded-lg text-[13px] font-bold capitalize transition-all }>
                {m} SMS
              </button>
            ))}
          </div>
'''
c = re.sub(r'(<p className=\"text-\[12\.5px\] text-gray-400 mt-0\.5\">Compose and dispatch your campaign below</p>\s*</div>)', r'\1' + tabs, c)

# Remove inner Send Mode Toggles (the grid cell)
c = re.sub(r'\{/\* Mode Toggles \*/\}.*?<p className=\"text-\[12px\].*?Send Mode.*?</button>\s*</div>\s*</div>', '', c, flags=re.DOTALL)

# Also fix the grid from grid-cols-2 to grid-cols-1 if I removed the mode toggles.
# Actually I'll just let it be, but I'll remove the second Summary button
c = re.sub(r'<button onClick=\{.*?setShowPreview.*?Summary\s*</button>', '', c, flags=re.DOTALL)

# Also, update grid layout so it doesn't leave an empty right side
c = re.sub(r'<div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\s*<div className=\"space-y-4\">', 
           '<div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">', c)
c = re.sub(r'</Field>\s*</div>\s*</div>', '</Field></div>', c)

with open('frontend/src/pages/SendSms.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
