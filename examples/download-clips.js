import { createClient } from '../src/index.js';
import path from 'path';

const client = createClient({
  timeout: 60000 // Extended timeout for downloads
});

async function demonstrateClipDownloads() {
  console.log('=== Pump.fun Clip Download Demo ===\n');

  try {
    // Step 1: Find some tokens with available clips
    console.log('1. Finding tokens with available clips...');

    // Get some live coins first
    const liveCoins = await client.getCurrentlyLiveCoins({ limit: 5 });

    if (liveCoins.length === 0) {
      console.log('No live coins found. Trying to get clips from a known token...');

      // Use a known token for demo (you can replace this with any token mint)
      const demoMint = '43yfnktSfyKkPXRLyevHu8rNXwWHxTXS1ntQbeArpump';

      console.log(`Fetching clips for token: ${demoMint}`);

      try {
        // Get highlight clips
        const highlights = await client.getHighlightClips(demoMint, 3);
        console.log(`Found ${highlights.clips.length} highlight clips`);

        if (highlights.clips.length > 0) {
          await downloadClipsExamples(highlights.clips, demoMint);
        }

        // Get complete streams
        const completeStreams = await client.getCompleteStreams(demoMint, 2);
        console.log(`Found ${completeStreams.clips.length} complete streams`);

        if (completeStreams.clips.length > 0) {
          await downloadCompleteStreamExamples(completeStreams.clips, demoMint);
        }

      } catch (error) {
        console.log(`Error fetching clips for demo token: ${error.message}`);
        console.log('This is normal if the token has no clips available');
      }

    } else {
      console.log(`Found ${liveCoins.length} live coins. Checking for clips...`);

      for (const coin of liveCoins.slice(0, 2)) {
        console.log(`\nChecking clips for: ${coin.name} (${coin.symbol})`);

        try {
          // Get highlight clips
          const highlights = await client.getHighlightClips(coin.mint, 2);

          if (highlights.clips.length > 0) {
            console.log(`  Found ${highlights.clips.length} highlight clips`);
            await downloadClipsExamples(highlights.clips, coin.symbol);
            break; // Demo with first found clips
          }
        } catch (error) {
          console.log(`  No clips available for this token`);
        }
      }
    }

    console.log('\n=== Download demo completed ===');

  } catch (error) {
    console.error('Download demo failed:', error.message);
  }
}

async function downloadClipsExamples(clips, tokenSymbol) {
  console.log('\n2. Downloading highlight clips...');

  const outputDir = path.join(process.cwd(), 'downloads', tokenSymbol);

  for (const [index, clip] of clips.entries()) {
    try {
      console.log(`\nDownloading clip ${index + 1}:`);
      console.log(`  Duration: ${clip.duration}s`);
      console.log(`  Created: ${clip.createdAt}`);

      // Get download info first
      const downloadInfo = await client.getClipDownloadInfo(clip);
      console.log(`  Format: ${downloadInfo.format}`);
      console.log(`  Estimated size: ${downloadInfo.estimatedSize ? `${(downloadInfo.estimatedSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}`);
      console.log(`  Requires ffmpeg: ${downloadInfo.requiresFfmpeg}`);

      // Download with progress tracking
      const outputPath = path.join(outputDir, `highlight-${index + 1}.mp4`);

      const result = await client.downloadHighlightClip(clip, outputPath, {
        onProgress: (progress, downloaded, total) => {
          const percent = progress.toFixed(1);
          const downloadedMB = (downloaded / 1024 / 1024).toFixed(2);
          const totalMB = (total / 1024 / 1024).toFixed(2);
          process.stdout.write(`\r  Progress: ${percent}% (${downloadedMB}/${totalMB} MB)`);
        }
      });

      console.log(`\n  ✅ Downloaded to: ${result.path}`);
      console.log(`  File size: ${(result.size / 1024 / 1024).toFixed(2)} MB`);

      // Also download thumbnail
      const thumbnailPath = path.join(outputDir, `thumbnail-${index + 1}.jpg`);
      try {
        const thumbnailResult = await client.downloadThumbnail(clip, thumbnailPath);
        console.log(`  ✅ Thumbnail downloaded to: ${thumbnailResult.path}`);
      } catch (thumbError) {
        console.log(`  ⚠️  Thumbnail download failed: ${thumbError.message}`);
      }

    } catch (error) {
      console.log(`  ❌ Failed to download clip ${index + 1}: ${error.message}`);
    }
  }
}

async function downloadCompleteStreamExamples(clips, tokenSymbol) {
  console.log('\n3. Downloading complete streams (HLS)...');

  for (const [index, clip] of clips.entries()) {
    try {
      console.log(`\nProcessing complete stream ${index + 1}:`);
      console.log(`  Duration: ${clip.duration}s`);
      console.log(`  Session: ${clip.sessionId}`);

      // Get download info
      const downloadInfo = await client.getClipDownloadInfo(clip);
      console.log(`  Format: ${downloadInfo.format} (requires ffmpeg)`);

      // Note: HLS downloads require ffmpeg to be installed
      console.log(`  ⚠️  This requires ffmpeg to be installed on your system`);
      console.log(`  Install with: apt-get install ffmpeg (Ubuntu) or brew install ffmpeg (MacOS)`);

      // Uncomment the following lines to try downloading (if ffmpeg is available)
      /*
      const outputDir = path.join(process.cwd(), 'downloads', tokenSymbol);
      const outputPath = path.join(outputDir, `complete-stream-${index + 1}.mp4`);

      const result = await client.downloadCompleteStream(clip, outputPath, {
        onProgress: (progress, currentTime, totalTime) => {
          const percent = progress.toFixed(1);
          const currentMin = Math.floor(currentTime / 60);
          const currentSec = Math.floor(currentTime % 60);
          const totalMin = Math.floor(totalTime / 60);
          const totalSec = Math.floor(totalTime % 60);
          process.stdout.write(`\r  Progress: ${percent}% (${currentMin}:${currentSec.toString().padStart(2, '0')}/${totalMin}:${totalSec.toString().padStart(2, '0')})`);
        },
        ffmpegPath: 'ffmpeg' // or specify path to ffmpeg executable
      });

      console.log(`\n  ✅ Downloaded to: ${result.path}`);
      console.log(`  Duration: ${result.duration}s`);
      */

    } catch (error) {
      console.log(`  ❌ Failed to process complete stream ${index + 1}: ${error.message}`);
    }
  }
}

async function demonstrateBatchDownloads() {
  console.log('\n\n4. Batch download demonstration...');

  // Example: Download multiple clips at once
  const demoClips = [
    {
      clipId: 'demo-clip-1',
      mp4Url: 'https://example.com/clip1.mp4', // Replace with real URLs
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      createdAt: new Date().toISOString(),
      duration: 30,
      clipType: 'HIGHLIGHT'
    },
    {
      clipId: 'demo-clip-2',
      mp4Url: 'https://example.com/clip2.mp4', // Replace with real URLs
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      createdAt: new Date().toISOString(),
      duration: 45,
      clipType: 'HIGHLIGHT'
    }
  ].filter(clip => clip.mp4Url); // Filter out demo clips

  if (demoClips.length === 0) {
    console.log('  No real clips available for batch download demo');
    console.log('  Replace demo clip URLs with real clip URLs to test batch downloads');
    return;
  }

  const outputDir = path.join(process.cwd(), 'downloads', 'batch');

  try {
    const results = await client.downloadHighlightClips(demoClips, outputDir, {
      concurrency: 2, // Download 2 clips simultaneously
      filenameGenerator: (clip, index) => {
        const timestamp = new Date(clip.createdAt).toISOString().slice(0, 19).replace(/[:.]/g, '-');
        return `batch-clip-${index + 1}-${timestamp}.mp4`;
      },
      onProgress: (progress, downloaded, total) => {
        // This will be called for each individual download
      }
    });

    console.log(`  Batch download completed:`);
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`    ✅ Clip ${index + 1}: ${result.path}`);
      } else {
        console.log(`    ❌ Clip ${index + 1}: ${result.error}`);
      }
    });

  } catch (error) {
    console.log(`  Batch download failed: ${error.message}`);
  }
}

// Run all demonstrations
async function runAllDemos() {
  await demonstrateClipDownloads();
  await demonstrateBatchDownloads();
}

// Check if ffmpeg is available
async function checkFfmpegAvailability() {
  try {
    const { spawn } = await import('child_process');
    await new Promise((resolve, reject) => {
      const ffmpegCheck = spawn('ffmpeg', ['-version'], { stdio: 'ignore' });
      ffmpegCheck.on('close', (code) => {
        if (code === 0) {
          console.log('✅ ffmpeg is available for HLS downloads');
          resolve();
        } else {
          console.log('⚠️  ffmpeg not found - HLS downloads will not work');
          console.log('   Install ffmpeg: apt-get install ffmpeg (Ubuntu) or brew install ffmpeg (MacOS)');
          reject();
        }
      });
      ffmpegCheck.on('error', () => {
        console.log('⚠️  ffmpeg not found - HLS downloads will not work');
        console.log('   Install ffmpeg: apt-get install ffmpeg (Ubuntu) or brew install ffmpeg (MacOS)');
        reject();
      });
    });
    return true;
  } catch {
    return false;
  }
}

// Start demos
console.log('Starting download demonstrations...\n');

checkFfmpegAvailability().then(() => {
  runAllDemos();
}).catch(() => {
  console.log('Proceeding with MP4 downloads only...\n');
  runAllDemos();
});