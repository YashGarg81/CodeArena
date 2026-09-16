const fs = require('fs');
const html = fs.readFileSync('playlist_dump.html', 'utf8');

const i = html.indexOf('var ytInitialData = ');
const start = i + 'var ytInitialData = '.length;
let depth = 0;
let end = -1;
for (let j = start; j < html.length; j++) {
  if (html[j] === '{') depth++;
  else if (html[j] === '}') {
    depth--;
    if (depth === 0) {
      end = j + 1;
      break;
    }
  }
}

console.log("start:", start, "end:", end);
const jsonStr = html.substring(start, end);
fs.writeFileSync('ytInitialData.json', jsonStr);
console.log("Wrote ytInitialData.json, length:", jsonStr.length);

const data = JSON.parse(jsonStr);

// Search for items in data
function searchKeys(obj, path = "") {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => searchKeys(item, path + `[${idx}]`));
    return;
  }
  if (obj.videoId) {
    console.log("Found videoId at", path, obj.videoId, obj.title);
  }
  for (const k of Object.keys(obj)) {
    searchKeys(obj[k], path + "." + k);
  }
}
searchKeys(data);
