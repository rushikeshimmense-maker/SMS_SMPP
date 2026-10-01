const fs = require('fs');
const path = 'C:/Users/Immense/.gemini/antigravity/brain/58b0dac7-90d2-4307-bc10-1930c906bcd7/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');

for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.step_index === 2025 && obj.type === 'PLANNER_RESPONSE') {
            for (const tc of obj.tool_calls) {
                if (tc.name === 'write_to_file') {
                    console.log(tc.args.CodeContent);
                }
            }
        }
    } catch (e) {}
}
