const fs = require('fs');
const path = 'C:/Users/Immense/.gemini/antigravity/brain/58b0dac7-90d2-4307-bc10-1930c906bcd7/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');

for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.step_index >= 2340 && obj.step_index <= 2350) {
            console.log(`\n--- STEP ${obj.step_index} ---`);
            if (obj.type === 'PLANNER_RESPONSE') {
                console.log(JSON.stringify(obj.tool_calls, null, 2));
            } else if (obj.type === 'GENERIC' || obj.type === 'USER_INPUT') {
                console.log(obj.content.substring(0, 300) + '...');
            }
        }
    } catch (e) {}
}
