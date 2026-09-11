function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

const fs = require('fs');
try {
    const raw = fs.readFileSync(0, 'utf-8');
    const lines = raw.split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 0);
    if (lines.length >= 2) {
        const nums = lines[0].split(/\s+/).map(Number);
        const target = Number(lines[1]);
        const result = twoSum(nums, target);
        if (Array.isArray(result)) {
            console.log(result.slice().sort((a,b) => a-b).join(' '));
        } else {
            console.log("");
        }
    }
} catch (e) { console.error(e.message); process.exit(1); }