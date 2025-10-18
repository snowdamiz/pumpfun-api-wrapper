import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import stream from 'stream';

const pipeline = promisify(stream.pipeline);

/**
 * Main client class for interacting with Pump.fun APIs
 */
export class PumpFunClient {
  constructor(options = {}) {
    this.baseUrls = {
      main: 'https://frontend-api-v3.pump.fun',
      swap: 'https://swap-api.pump.fun',
      livestream: 'https://livestream-api.pump.fun',
      chat: 'https://chat-api-v1.pump.fun',
      web: 'https://pump.fun'
    };

    this.defaultHeaders = {
      'accept': '*/*',
      'Origin': 'https://pump.fun',
      ...options.headers
    };

    this.timeout = options.timeout || 30000; // 30 seconds default
  }

  /**
   * Make HTTP request with error handling
   */
  async makeRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...this.defaultHeaders, ...options.headers },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }

      throw error;
    }
  }

  /**
   * Get currently live streaming coins
   */
  async getCurrentlyLiveCoins(params = {}) {
    const {
      offset = 0,
      limit = 60,
      sort = 'currently_live',
      order = 'DESC',
      includeNsfw = false
    } = params;

    const queryParams = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
      sort,
      order,
      includeNsfw: includeNsfw.toString()
    });

    const url = `${this.baseUrls.main}/coins/currently-live?${queryParams}`;
    return this.makeRequest(url);
  }

  /**
   * Get stream clips for a token
   */
  async getStreamClips(mintId, params = {}) {
    if (!mintId) {
      throw new Error('mintId is required');
    }

    const { limit = 20, clipType } = params;

    if (!clipType) {
      throw new Error('clipType is required (COMPLETE or HIGHLIGHT)');
    }

    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      clipType
    });

    const url = `${this.baseUrls.livestream}/clips/${mintId}?${queryParams}`;
    return this.makeRequest(url);
  }

  /**
   * Get complete stream recordings for a token
   */
  async getCompleteStreams(mintId, limit = 20) {
    return this.getStreamClips(mintId, { limit, clipType: 'COMPLETE' });
  }

  /**
   * Get highlight clips for a token
   */
  async getHighlightClips(mintId, limit = 20) {
    return this.getStreamClips(mintId, { limit, clipType: 'HIGHLIGHT' });
  }

  /**
   * Check if token creator is approved for livestreaming
   */
  async checkCreatorLivestreamApproval(mintId) {
    if (!mintId) {
      throw new Error('mintId is required');
    }

    const queryParams = new URLSearchParams({ mintId });
    const url = `${this.baseUrls.livestream}/livestream/is-approved-creator?${queryParams}`;
    return this.makeRequest(url);
  }

  /**
   * Get current livestream status for a token
   */
  async getCurrentLivestream(mintId) {
    if (!mintId) {
      throw new Error('mintId is required');
    }

    const queryParams = new URLSearchParams({ mintId });
    const url = `${this.baseUrls.livestream}/livestream?${queryParams}`;
    return this.makeRequest(url);
  }

  /**
   * Get chat invite information for a token
   */
  async getCoinChatInvites(mintId) {
    if (!mintId) {
      throw new Error('mintId is required');
    }

    const url = `${this.baseUrls.chat}/invites/coin/${mintId}`;
    return this.makeRequest(url);
  }

  /**
   * Get current SOL price
   */
  async getSolPrice() {
    const url = `${this.baseUrls.main}/sol-price`;
    return this.makeRequest(url);
  }

  /**
   * Get platform flags and configuration
   */
  async getPlatformFlags() {
    const url = `${this.baseUrls.web}/api/flags`;
    return this.makeRequest(url);
  }

  /**
   * Download a highlight clip (MP4) to local file
   */
  async downloadHighlightClip(clipData, outputPath, options = {}) {
    if (!clipData.mp4Url) {
      throw new Error('Clip does not have an MP4 URL');
    }

    const {
      onProgress,
      timeout = 300000 // 5 minutes for video downloads
    } = options;

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(clipData.mp4Url, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Download failed: HTTP ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      let downloaded = 0;

      const fileStream = fs.createWriteStream(outputPath);

      if (onProgress && contentLength) {
        const totalSize = parseInt(contentLength);

        response.body.on('data', (chunk) => {
          downloaded += chunk.length;
          const progress = (downloaded / totalSize) * 100;
          onProgress(progress, downloaded, totalSize);
        });
      }

      await pipeline(response.body, fileStream);

      return {
        success: true,
        path: outputPath,
        size: downloaded,
        clip: clipData
      };

    } catch (error) {
      clearTimeout(timeoutId);

      // Clean up partial file if download failed
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }

      if (error.name === 'AbortError') {
        throw new Error(`Download timeout after ${timeout}ms`);
      }

      throw error;
    }
  }

  /**
   * Download multiple highlight clips
   */
  async downloadHighlightClips(clips, outputDir, options = {}) {
    if (!Array.isArray(clips)) {
      throw new Error('Clips must be an array');
    }

    const {
      concurrency = 3,
      filenameGenerator = (clip, index) => {
        const timestamp = new Date(clip.createdAt).toISOString().replace(/[:.]/g, '-');
        return `clip-${index + 1}-${timestamp}.mp4`;
      }
    } = options;

    const results = [];

    // Process clips in batches to control concurrency
    for (let i = 0; i < clips.length; i += concurrency) {
      const batch = clips.slice(i, i + concurrency);

      const batchPromises = batch.map(async (clip, batchIndex) => {
        const globalIndex = i + batchIndex;
        const filename = filenameGenerator(clip, globalIndex);
        const outputPath = path.join(outputDir, filename);

        try {
          return await this.downloadHighlightClip(clip, outputPath, options);
        } catch (error) {
          return {
            success: false,
            error: error.message,
            clip: clip
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Download thumbnail image
   */
  async downloadThumbnail(clipData, outputPath, options = {}) {
    if (!clipData.thumbnailUrl) {
      throw new Error('Clip does not have a thumbnail URL');
    }

    const { timeout = 30000 } = options;

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(clipData.thumbnailUrl, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Thumbnail download failed: HTTP ${response.status}`);
      }

      const fileStream = fs.createWriteStream(outputPath);
      await pipeline(response.body, fileStream);

      return {
        success: true,
        path: outputPath,
        clip: clipData
      };

    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(`Thumbnail download timeout after ${timeout}ms`);
      }

      throw error;
    }
  }

  /**
   * Download a complete stream (HLS) to local file
   * Note: This requires ffmpeg to be installed on the system
   */
  async downloadCompleteStream(clipData, outputPath, options = {}) {
    if (!clipData.playlistUrl) {
      throw new Error('Clip does not have a playlist URL');
    }

    const {
      onProgress,
      timeout = 600000, // 10 minutes for long videos
      ffmpegPath = 'ffmpeg' // Use ffmpeg from PATH by default
    } = options;

    // Check if ffmpeg is available
    try {
      const { spawn } = await import('child_process');
      await new Promise((resolve, reject) => {
        const ffmpegCheck = spawn(ffmpegPath, ['-version'], { stdio: 'ignore' });
        ffmpegCheck.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`ffmpeg not found. Please install ffmpeg or specify ffmpegPath`));
        });
        ffmpegCheck.on('error', (error) => {
          reject(new Error(`ffmpeg not found: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(`ffmpeg required for HLS downloads: ${error.message}`);
    }

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const { spawn } = await import('child_process');

    return new Promise((resolve, reject) => {
      const args = [
        '-i', clipData.playlistUrl,
        '-c', 'copy',
        '-bsf:a', 'aac_adtstoasc',
        '-y', // Overwrite output file
        outputPath
      ];

      const ffmpeg = spawn(ffmpegPath, args);
      let totalDuration = null;
      let currentTime = 0;

      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString();

        // Parse ffmpeg progress output
        const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
        if (durationMatch && !totalDuration) {
          const [, hours, minutes, seconds] = durationMatch;
          totalDuration = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds);
        }

        const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
        if (timeMatch && totalDuration) {
          const [, hours, minutes, seconds] = timeMatch;
          currentTime = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds);
          const progress = (currentTime / totalDuration) * 100;

          if (onProgress) {
            onProgress(progress, currentTime, totalDuration);
          }
        }
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            path: outputPath,
            duration: currentTime,
            clip: clipData
          });
        } else {
          reject(new Error(`ffmpeg failed with code ${code}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(new Error(`ffmpeg error: ${error.message}`));
      });

      // Set timeout
      const timeoutId = setTimeout(() => {
        ffmpeg.kill('SIGKILL');
        reject(new Error(`Download timeout after ${timeout}ms`));
      }, timeout);

      ffmpeg.on('close', () => {
        clearTimeout(timeoutId);
      });
    });
  }

  /**
   * Download clip (automatic format detection)
   */
  async downloadClip(clipData, outputPath, options = {}) {
    if (clipData.clipType === 'COMPLETE') {
      return this.downloadCompleteStream(clipData, outputPath, options);
    } else if (clipData.clipType === 'HIGHLIGHT') {
      return this.downloadHighlightClip(clipData, outputPath, options);
    } else {
      throw new Error(`Unknown clip type: ${clipData.clipType}`);
    }
  }

  /**
   * Get download progress information for clips
   */
  async getClipDownloadInfo(clipData) {
    if (!clipData.mp4Url && !clipData.playlistUrl) {
      throw new Error('Clip does not have downloadable content');
    }

    let downloadUrl = clipData.mp4Url || clipData.playlistUrl;
    let estimatedSize = null;

    try {
      // Try to get content length from HEAD request
      const response = await fetch(downloadUrl, { method: 'HEAD' });

      if (response.ok) {
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          estimatedSize = parseInt(contentLength);
        }
      }
    } catch (error) {
      // Ignore errors for size detection
    }

    return {
      downloadUrl,
      estimatedSize,
      type: clipData.clipType,
      duration: clipData.duration,
      format: clipData.clipType === 'COMPLETE' ? 'HLS' : 'MP4',
      requiresFfmpeg: clipData.clipType === 'COMPLETE'
    };
  }
}