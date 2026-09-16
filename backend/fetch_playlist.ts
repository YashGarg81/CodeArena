const playlistUrl = "https://www.youtube.com/playlist?list=PLDzeHZWIZsTqNW1gvXXAicBgku9uPZeOC";
async function run() {
  const res = await fetch(playlistUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  });
  const html = await res.text();
  const fs = require('fs');
  fs.writeFileSync('playlist_dump.html', html);
  console.log("Dumped HTML, size:", html.length);
  
  // Search for video titles and IDs
  const re = /"title":\{"runs":\[\{"text":"([^"]+)"\}\].*?"navigationEndpoint":\{"clickTrackingParams":"[^"]*","commandMetadata":\{"webCommandMetadata":\{"url":"\/watch\?v=([a-zA-Z0-9_-]{11})/g;
  let m;
  const list = [];
  while ((m = re.exec(html)) !== null) {
    list.push({ title: m[1], videoId: m[2] });
  }
  console.log("Regex list count:", list.length);
  if (list.length > 0) {
    console.log(list.slice(0, 10));
  }
}
run();
