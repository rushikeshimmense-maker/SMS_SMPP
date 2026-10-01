const fs = require('fs');
let path = 'src/pages/Reports.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import DateRangePicker')) {
  content = content.replace(
    "import { DownloadIcon } from '../components/Icons.jsx'",
    "import { DownloadIcon } from '../components/Icons.jsx'\nimport DateRangePicker from '../components/DateRangePicker.jsx'"
  );
  fs.writeFileSync(path, content);
  console.log('Import added successfully.');
} else {
  console.log('Import already exists.');
}
