import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { PumpFunClient } from '../src/client.js';

describe('Download Functionality', () => {
  const client = new PumpFunClient();
  const testDir = path.join(process.cwd(), 'test-downloads');

  // Cleanup function
  function cleanupTestFiles() {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  }

  // Run cleanup after tests
  test.after(() => {
    cleanupTestFiles();
  });

  test('should throw error for clip without MP4 URL', async () => {
    const clipWithoutMp4 = {
      clipId: 'test-clip',
      clipType: 'HIGHLIGHT',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      createdAt: new Date().toISOString(),
      duration: 30
    };

    await assert.rejects(
      () => client.downloadHighlightClip(clipWithoutMp4, 'test.mp4'),
      new Error('Clip does not have an MP4 URL')
    );
  });

  test('should throw error for complete stream without playlist URL', async () => {
    const clipWithoutPlaylist = {
      clipId: 'test-stream',
      clipType: 'COMPLETE',
      mp4Url: null,
      playlistUrl: null,
      createdAt: new Date().toISOString(),
      duration: 3600
    };

    await assert.rejects(
      () => client.downloadCompleteStream(clipWithoutPlaylist, 'test.mp4'),
      new Error('Clip does not have a playlist URL')
    );
  });

  test('should throw error for clip without download URL', async () => {
    const clipWithoutUrl = {
      clipId: 'test-clip',
      clipType: 'HIGHLIGHT',
      mp4Url: null,
      playlistUrl: null,
      createdAt: new Date().toISOString(),
      duration: 30
    };

    await assert.rejects(
      () => client.getClipDownloadInfo(clipWithoutUrl),
      new Error('Clip does not have downloadable content')
    );
  });

  test('should create download info for highlight clip', async () => {
    const highlightClip = {
      clipId: 'test-highlight',
      clipType: 'HIGHLIGHT',
      mp4Url: 'https://example.com/clip.mp4',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      createdAt: new Date().toISOString(),
      duration: 30
    };

    const info = await client.getClipDownloadInfo(highlightClip);

    assert.strictEqual(info.downloadUrl, 'https://example.com/clip.mp4');
    assert.strictEqual(info.type, 'HIGHLIGHT');
    assert.strictEqual(info.format, 'MP4');
    assert.strictEqual(info.duration, 30);
    assert.strictEqual(info.requiresFfmpeg, false);
  });

  test('should create download info for complete stream', async () => {
    const completeStream = {
      clipId: 'test-complete',
      clipType: 'COMPLETE',
      mp4Url: null,
      playlistUrl: 'https://example.com/playlist.m3u8',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      createdAt: new Date().toISOString(),
      duration: 3600
    };

    const info = await client.getClipDownloadInfo(completeStream);

    assert.strictEqual(info.downloadUrl, 'https://example.com/playlist.m3u8');
    assert.strictEqual(info.type, 'COMPLETE');
    assert.strictEqual(info.format, 'HLS');
    assert.strictEqual(info.duration, 3600);
    assert.strictEqual(info.requiresFfmpeg, true);
  });

  test('should create directory if it does not exist', async () => {
    const testPath = path.join(testDir, 'subdir', 'test.mp4');

    // Mock clip with MP4 URL
    const mockClip = {
      clipId: 'test-clip',
      clipType: 'HIGHLIGHT',
      mp4Url: 'https://httpbin.org/json', // Using a test endpoint
      thumbnailUrl: 'https://example.com/thumb.jpg',
      createdAt: new Date().toISOString(),
      duration: 1
    };

    // This will fail during the download, but directory should be created
    try {
      await client.downloadHighlightClip(mockClip, testPath);
    } catch (error) {
      // Expected to fail
    }

    // Directory should exist even if download failed
    assert(fs.existsSync(path.join(testDir, 'subdir')));
  });

  test('should handle batch download options', () => {
    const clips = [
      { clipId: 'clip1', mp4Url: 'https://example.com/1.mp4', clipType: 'HIGHLIGHT', createdAt: new Date().toISOString(), duration: 30 },
      { clipId: 'clip2', mp4Url: 'https://example.com/2.mp4', clipType: 'HIGHLIGHT', createdAt: new Date().toISOString(), duration: 45 }
    ];

    // Test that the method exists and handles array input
    const downloadPromise = client.downloadHighlightClips(clips, testDir, {
      concurrency: 2,
      filenameGenerator: (clip, index) => `custom-${index}.mp4`
    });

    assert(downloadPromise instanceof Promise);
  });

  test('should detect clip type automatically', async () => {
    const highlightClip = {
      clipId: 'test-highlight',
      clipType: 'HIGHLIGHT',
      mp4Url: 'https://example.com/clip.mp4',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      createdAt: new Date().toISOString(),
      duration: 30
    };

    const completeStream = {
      clipId: 'test-complete',
      clipType: 'COMPLETE',
      mp4Url: null,
      playlistUrl: 'https://example.com/playlist.m3u8',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      createdAt: new Date().toISOString(),
      duration: 3600
    };

    // Test highlight clip - should fail due to invalid URL but not type detection
    await assert.rejects(
      () => client.downloadClip(highlightClip, 'highlight.mp4'),
      /Download failed/
    );

    // Test complete stream - should fail due to ffmpeg not available
    await assert.rejects(
      () => client.downloadClip(completeStream, 'complete.mp4'),
      /ffmpeg/
    );
  });

  test('should handle thumbnail download', async () => {
    const clipWithThumbnail = {
      clipId: 'test-clip',
      clipType: 'HIGHLIGHT',
      mp4Url: 'https://example.com/clip.mp4',
      thumbnailUrl: 'https://httpbin.org/json', // Using test endpoint
      createdAt: new Date().toISOString(),
      duration: 30
    };

    const testPath = path.join(testDir, 'thumb.jpg');

    // This will fail during download but should validate inputs
    try {
      await client.downloadThumbnail(clipWithThumbnail, testPath);
    } catch (error) {
      // Expected to fail
    }

    // Directory should be created
    assert(fs.existsSync(testDir));
  });
});