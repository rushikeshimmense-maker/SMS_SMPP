const fs = require('fs');
let path = 'add_action_buttons.cjs';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("content.includes('function getRefundAmount')", "content.includes('async function submitCreate()')");
content = content.replace("content = content.replace('function getRefundAmount', functionsToInject)", "content = content.replace('async function submitCreate()', functionsToInject)");
content = content.replace("  function getRefundAmount", "  async function submitCreate()");

fs.writeFileSync(path, content);
console.log('Fixed add_action_buttons.cjs to use submitCreate');
