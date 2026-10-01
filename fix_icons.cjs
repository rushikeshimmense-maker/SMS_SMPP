const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'Icons.jsx');
let content = fs.readFileSync(file, 'utf8');

const plusMinusCases = `
    case 'plus':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )
    case 'minus':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )
    case 'chevron-down':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      )
    case 'chevron-right':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )
`;

content = content.replace("case 'dashboard':", plusMinusCases + "    case 'dashboard':");

fs.writeFileSync(file, content);
console.log("Added missing icons to Icons.jsx");
