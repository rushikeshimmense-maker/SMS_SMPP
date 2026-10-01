const fs = require('fs');
const path = 'C:/Users/Immense/.gemini/antigravity/brain/58b0dac7-90d2-4307-bc10-1930c906bcd7/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');

for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.type === 'PLANNER_RESPONSE' && obj.tool_calls) {
            for (const tc of obj.tool_calls) {
                if (tc.name === 'write_to_file' || tc.name === 'replace_file_content') {
                    const argsStr = JSON.stringify(tc.args);
                    if (argsStr.includes('Tree') || argsStr.includes('tree')) {
                        console.log(`\n--- STEP ${obj.step_index} (${tc.name}) ---`);
                        // Only print the first 200 chars to save space
                        console.log(argsStr.substring(0, 200) + '...');
                    }
                }
            }
        }
    } catch (e) {}
}
