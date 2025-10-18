# Pump.fun API

A comprehensive Node.js wrapper for the Pump.fun public APIs, providing easy access to live streaming tokens, market data, and social features.

## Installation

```bash
npm install pumpfun-api
```

## Quick Start

```javascript
import { createClient, getCurrentlyLiveCoins, getSolPrice } from 'pumpfun-api';

// Get current live streaming coins
const liveCoins = await getCurrentlyLiveCoins({ limit: 10 });
console.log(`Found ${liveCoins.length} live coins`);

// Get SOL price
const { solPrice } = await getSolPrice();
console.log(`SOL is currently $${solPrice}`);
```

## Features

- 🚀 Full coverage of Pump.fun public APIs
- 📺 Live streaming token data
- 💰 Market data and SOL prices
- 🎬 Stream clips and highlights
- 💬 Chat and social features
- 🔒 Built-in error handling and timeouts
- 📝 Full TypeScript support
- 📖 Comprehensive examples

## API Methods

### Live Streaming Coins

```javascript
// Get currently live coins with pagination
const liveCoins = await client.getCurrentlyLiveCoins({
  offset: 0,        // Skip items (default: 0)
  limit: 60,        // Items to return (default: 60, max: 60)
  sort: 'currently_live', // Sort field
  order: 'DESC',    // Sort order (ASC/DESC)
  includeNsfw: false // Include NSFW content
});
```

### Stream Clips and Highlights

```javascript
// Get complete stream recordings
const completeStreams = await client.getCompleteStreams(mintId, 20);

// Get highlight clips
const highlights = await client.getHighlightClips(mintId, 20);

// Generic clip retrieval
const clips = await client.getStreamClips(mintId, {
  limit: 20,
  clipType: 'COMPLETE' // or 'HIGHLIGHT'
});
```

### Livestream Status

```javascript
// Check if creator is approved for livestreaming
const approval = await client.checkCreatorLivestreamApproval(mintId);

// Get current livestream status
const livestream = await client.getCurrentLivestream(mintId);
```

### Chat and Social

```javascript
// Get chat invite information
const invites = await client.getCoinChatInvites(mintId);
```

### Market Data

```javascript
// Get current SOL price
const solPrice = await client.getSolPrice();

// Get platform flags and configuration
const flags = await client.getPlatformFlags();
```

### Download Clips

```javascript
// Download a highlight clip (MP4)
const clip = { /* StreamClip object */ };
const result = await client.downloadHighlightClip(clip, './downloads/clip.mp4', {
  onProgress: (progress, downloaded, total) => {
    console.log(`Download: ${progress.toFixed(1)}%`);
  }
});

// Download a complete stream (HLS) - requires ffmpeg
const completeResult = await client.downloadCompleteStream(clip, './downloads/complete.mp4', {
  onProgress: (progress, currentTime, totalTime) => {
    console.log(`Progress: ${progress.toFixed(1)}%`);
  },
  ffmpegPath: 'ffmpeg' // or path to ffmpeg executable
});

// Download with automatic format detection
const autoResult = await client.downloadClip(clip, './downloads/auto.mp4');

// Download multiple clips
const results = await client.downloadHighlightClips(clips, './downloads/', {
  concurrency: 3, // Download 3 clips simultaneously
  filenameGenerator: (clip, index) => `clip-${index + 1}.mp4`
});

// Download thumbnail
const thumbResult = await client.downloadThumbnail(clip, './downloads/thumb.jpg');

// Get download information
const info = await client.getClipDownloadInfo(clip);
console.log(`Format: ${info.format}, Size: ${info.estimatedSize} bytes`);
```

## Client Configuration

```javascript
import { createClient } from 'pumpfun-api';

const client = createClient({
  timeout: 30000, // Request timeout in milliseconds
  headers: {
    'User-Agent': 'My-App/1.0'
  }
});
```

## Data Structures

### Live Coin Object

```javascript
{
  mint: "string",              // Solana token mint address
  name: "string",              // Coin name
  symbol: "string",            // Ticker symbol
  description: "string",       // Coin description
  image_uri: "string",         // IPFS image URL
  market_cap: 12345.67,        // USD market cap
  is_currently_live: true,     // Live streaming status
  livestream_title: "string",  // Livestream title
  creator: "string",           // Creator wallet address
  // ... many more fields
}
```

### Stream Clip Object

```javascript
{
  clipId: "string",
  sessionId: "string",
  startTime: "2023-10-18T15:30:00Z",
  endTime: "2023-10-18T16:30:00Z",
  duration: 3600,              // Duration in seconds
  playlistUrl: "string",       // HLS playlist URL (for COMPLETE clips)
  mp4Url: "string",            // Direct MP4 URL (for HIGHLIGHT clips)
  thumbnailUrl: "string",      // Thumbnail image URL
  clipType: "COMPLETE" | "HIGHLIGHT",
  createdAt: "2023-10-18T16:45:00Z"
}
```

## Downloading Clips

### Prerequisites

- **MP4 Downloads**: No additional requirements
- **HLS Downloads**: Requires [ffmpeg](https://ffmpeg.org/) to be installed
  - Ubuntu: `sudo apt-get install ffmpeg`
  - macOS: `brew install ffmpeg`
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

### Download Types

The package supports two types of downloads:

1. **Highlight Clips (HIGHLIGHT)**: Direct MP4 downloads
2. **Complete Streams (COMPLETE)**: HLS streams converted to MP4 using ffmpeg

### Download Options

```javascript
const options = {
  onProgress: (progress, downloaded, total) => {
    // Progress callback (0-100%)
    console.log(`Progress: ${progress.toFixed(1)}%`);
  },
  timeout: 300000, // Download timeout in milliseconds
  ffmpegPath: 'ffmpeg' // Path to ffmpeg executable (for HLS downloads)
};
```

### Download Results

```javascript
{
  success: true,
  path: '/path/to/downloaded/file.mp4',
  size: 1234567, // File size in bytes
  clip: { /* Original clip data */ }
}
```

### Batch Downloads

```javascript
// Download multiple clips with concurrency control
const results = await client.downloadHighlightClips(clips, './downloads/', {
  concurrency: 3, // Max simultaneous downloads
  filenameGenerator: (clip, index) => {
    // Custom filename generation
    return `clip-${index + 1}-${clip.clipId}.mp4`;
  },
  onProgress: (progress, downloaded, total) => {
    // Progress for individual downloads
  }
});

// Check results
results.forEach(result => {
  if (result.success) {
    console.log(`Downloaded: ${result.path}`);
  } else {
    console.log(`Failed: ${result.error}`);
  }
});
```

## Examples

### Basic Usage

```javascript
import { createClient } from 'pumpfun-api';

const client = createClient();

// Get live coins and their details
const liveCoins = await client.getCurrentlyLiveCoins({ limit: 10 });

for (const coin of liveCoins) {
  console.log(`${coin.name} (${coin.symbol})`);
  console.log(`Market Cap: $${coin.market_cap.toLocaleString()}`);
  console.log(`Live: ${coin.is_currently_live}`);

  if (coin.is_currently_live) {
    const clips = await client.getHighlightClips(coin.mint, 3);
    console.log(`Clips: ${clips.clips.length} available`);
  }
}
```

### Advanced Usage with Pagination

```javascript
// Get all live coins with pagination
let allCoins = [];
let offset = 0;
const limit = 60;

while (true) {
  const coins = await client.getCurrentlyLiveCoins({ offset, limit });

  if (coins.length === 0) break;

  allCoins = allCoins.concat(coins);
  offset += limit;
}

// Filter high market cap tokens
const highCapTokens = allCoins
  .filter(coin => coin.market_cap > 100000)
  .sort((a, b) => b.market_cap - a.market_cap);
```

### Error Handling

```javascript
import { createClient } from 'pumpfun-api';

const client = createClient({ timeout: 10000 });

try {
  const liveCoins = await client.getCurrentlyLiveCoins();
  console.log(`Found ${liveCoins.length} live coins`);
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('Request timed out');
  } else if (error.message.includes('HTTP error')) {
    console.error('API error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Download Example

```javascript
import { createClient } from 'pumpfun-api';

const client = createClient();

async function downloadTokenClips(mintId) {
  try {
    // Get highlight clips
    const { clips } = await client.getHighlightClips(mintId, 5);

    console.log(`Found ${clips.length} clips, downloading...`);

    // Download each clip with progress tracking
    for (const [index, clip] of clips.entries()) {
      try {
        const result = await client.downloadHighlightClip(
          clip,
          `./downloads/clip-${index + 1}.mp4`,
          {
            onProgress: (progress) => {
              process.stdout.write(`\rClip ${index + 1}: ${progress.toFixed(1)}%`);
            }
          }
        );

        console.log(`\n✅ Downloaded: ${result.path}`);
        console.log(`   Size: ${(result.size / 1024 / 1024).toFixed(2)} MB`);

      } catch (error) {
        console.log(`\n❌ Failed to download clip ${index + 1}: ${error.message}`);
      }
    }

    // Batch download thumbnails
    const thumbnailResults = await client.downloadHighlightClips(
      clips.map(clip => ({ ...clip, mp4Url: clip.thumbnailUrl })),
      './downloads/thumbnails/',
      {
        concurrency: 5,
        filenameGenerator: (clip, index) => `thumb-${index + 1}.jpg`
      }
    );

    console.log(`\nDownloaded ${thumbnailResults.filter(r => r.success).length} thumbnails`);

  } catch (error) {
    console.error('Download failed:', error.message);
  }
}
```

## Running Examples

The package includes comprehensive examples:

```bash
# Run basic usage example
npm run example

# Or run examples directly
node examples/basic-usage.js
node examples/advanced-usage.js
node examples/download-clips.js
```

## TypeScript Support

This package includes full TypeScript definitions:

```typescript
import { PumpFunClient, LiveCoin, StreamClip } from 'pumpfun-api';

const client: PumpFunClient = createClient();
const coins: LiveCoin[] = await client.getCurrentlyLiveCoins();
const clips: { clips: StreamClip[] } = await client.getHighlightClips(mintId);
```

## API Endpoints

This wrapper covers the following Pump.fun API endpoints:

- **Live Streaming**: `GET /coins/currently-live`
- **Stream Clips**: `GET /clips/{mintId}`
- **Livestream Status**: `GET /livestream` and `GET /livestream/is-approved-creator`
- **Chat**: `GET /invites/coin/{mintId}`
- **Market Data**: `GET /sol-price` and `GET /api/flags`

## Rate Limiting

- Include proper headers (`Origin: https://pump.fun`) for better compatibility
- Implement appropriate delays between requests
- Handle timeouts gracefully with the built-in timeout configuration

## Clip Formats

### Complete Streams (clipType=COMPLETE)
- **Format**: HLS (HTTP Live Streaming)
- **URL**: `playlistUrl` contains the `.m3u8` playlist URL
- **Usage**: Requires HLS-compatible player

### Highlight Clips (clipType=HIGHLIGHT)
- **Format**: Direct MP4 download
- **URL**: `mp4Url` contains direct MP4 file URL
- **Usage**: Can be played directly or downloaded

## License

MIT

## Disclaimer

This package is a wrapper for publicly accessible API endpoints discovered through browser network traffic analysis. Use these APIs responsibly and in accordance with Pump.fun's terms of service.

The APIs may change without notice. This package will be updated to reflect any changes, but no guarantees are made about API availability or stability.