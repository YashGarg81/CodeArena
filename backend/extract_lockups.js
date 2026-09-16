const fs = require('fs');
const data = JSON.parse(fs.readFileSync('ytInitialData.json', 'utf8'));

const contents = data.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
console.log("Item contents length:", contents.length);

const videos = [];
for (let i = 0; i < contents.length; i++) {
  const item = contents[i];
  const lockup = item.lockupViewModel;
  if (!lockup) continue;
  
  // Find videoId
  const videoId = lockup.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId;
  
  // Find title
  const title = lockup.metadata?.lockupMetadataViewModel?.title?.content;
  
  // Find duration / metadata
  const duration = lockup.contentImage?.thumbnailViewModel?.overlays?.[0]?.thumbnailOverlayBadgeViewModel?.thumbnailBadges?.[0]?.thumbnailBadgeViewModel?.text;

  if (videoId && title) {
    videos.push({
      order: videos.length + 1,
      videoId,
      title,
      duration: duration || "30:00"
    });
  }
}

console.log("Extracted videos count:", videos.length);
console.log(JSON.stringify(videos.slice(0, 10), null, 2));
fs.writeFileSync('parsed_dsa_java_playlist.json', JSON.stringify(videos, null, 2));
