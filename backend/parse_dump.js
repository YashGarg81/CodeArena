const fs = require('fs');
const html = fs.readFileSync('playlist_dump.html', 'utf8');

// Find ytInitialData json object
const marker = 'var ytInitialData = ';
const idx = html.indexOf(marker);
if (idx !== -1) {
  const start = idx + marker.length;
  // find matching end of JS object
  let depth = 0;
  let end = start;
  for (let i = start; i < html.length; i++) {
    if (html[i] === '{') depth++;
    else if (html[i] === '}') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  const jsonStr = html.substring(start, end);
  const data = JSON.parse(jsonStr);
  console.log("Parsed data keys:", Object.keys(data));
  
  // Recursively search for playlistVideoRenderer
  const results = [];
  function walk(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (obj.playlistVideoRenderer) {
      const p = obj.playlistVideoRenderer;
      results.push({
        videoId: p.videoId,
        title: p.title?.runs?.[0]?.text || p.title?.simpleText,
        duration: p.lengthText?.simpleText,
        index: p.index?.simpleText
      });
    }
    for (const key of Object.keys(obj)) {
      walk(obj[key]);
    }
  }
  walk(data);
  console.log("Total playlistVideoRenderers found:", results.length);
  console.log(JSON.stringify(results.slice(0, 15), null, 2));
  fs.writeFileSync('parsed_playlist.json', JSON.stringify(results, null, 2));
} else {
  console.log("Marker not found");
}
