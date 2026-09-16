const fs = require('fs');
const data = JSON.parse(fs.readFileSync('playlist_dump.html', 'utf8').match(/var ytInitialData = ({.*?});<\/script>/s)?.[1] || '{}');

const videoItems = [];
function findVideos(obj) {
  if (!obj || typeof obj !== 'object') return;
  if (obj.videoId && obj.title) {
    const titleText = obj.title.runs ? obj.title.runs.map(r => r.text).join('') : (obj.title.simpleText || obj.title);
    videoItems.push({ videoId: obj.videoId, title: titleText });
  }
  for (const k of Object.keys(obj)) {
    findVideos(obj[k]);
  }
}
findVideos(data);
console.log("Found videos with videoId & title:", videoItems.length);
const unique = [];
const seen = new Set();
for (const v of videoItems) {
  if (!seen.has(v.videoId) && typeof v.title === 'string' && v.title.length > 3) {
    seen.add(v.videoId);
    unique.push(v);
  }
}
console.log("Unique:", unique.length);
console.log(JSON.stringify(unique.slice(0, 20), null, 2));
fs.writeFileSync('dsa_java_videos.json', JSON.stringify(unique, null, 2));
