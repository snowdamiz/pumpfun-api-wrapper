import { test, describe } from 'node:test';
import assert from 'node:assert';
import { PumpFunClient } from '../src/client.js';

describe('PumpFunClient', () => {
  test('should create client with default options', () => {
    const client = new PumpFunClient();
    assert.strictEqual(client.timeout, 30000);
    assert.strictEqual(client.defaultHeaders['Origin'], 'https://pump.fun');
  });

  test('should create client with custom options', () => {
    const customHeaders = { 'User-Agent': 'test-client' };
    const client = new PumpFunClient({
      timeout: 60000,
      headers: customHeaders
    });
    assert.strictEqual(client.timeout, 60000);
    assert.strictEqual(client.defaultHeaders['User-Agent'], 'test-client');
    assert.strictEqual(client.defaultHeaders['Origin'], 'https://pump.fun');
  });

  test('should throw error when mintId is missing for getStreamClips', async () => {
    const client = new PumpFunClient();
    await assert.rejects(
      () => client.getStreamClips('', { clipType: 'COMPLETE' }),
      new Error('mintId is required')
    );
  });

  test('should throw error when clipType is missing for getStreamClips', async () => {
    const client = new PumpFunClient();
    await assert.rejects(
      () => client.getStreamClips('test-mint', {}),
      new Error('clipType is required (COMPLETE or HIGHLIGHT)')
    );
  });

  test('should throw error when mintId is missing for other methods', async () => {
    const client = new PumpFunClient();

    await assert.rejects(
      () => client.checkCreatorLivestreamApproval(''),
      new Error('mintId is required')
    );

    await assert.rejects(
      () => client.getCurrentLivestream(''),
      new Error('mintId is required')
    );

    await assert.rejects(
      () => client.getCoinChatInvites(''),
      new Error('mintId is required')
    );
  });

  test('should build correct query parameters for getCurrentlyLiveCoins', async () => {
    const client = new PumpFunClient();

    // Mock the makeRequest method to capture the URL
    let capturedUrl = '';
    client.makeRequest = async (url) => {
      capturedUrl = url;
      return [];
    };

    await client.getCurrentlyLiveCoins({
      offset: 10,
      limit: 20,
      sort: 'market_cap',
      order: 'ASC',
      includeNsfw: true
    });

    assert(capturedUrl.includes('offset=10'));
    assert(capturedUrl.includes('limit=20'));
    assert(capturedUrl.includes('sort=market_cap'));
    assert(capturedUrl.includes('order=ASC'));
    assert(capturedUrl.includes('includeNsfw=true'));
  });

  test('should build correct query parameters for getStreamClips', async () => {
    const client = new PumpFunClient();

    let capturedUrl = '';
    client.makeRequest = async (url) => {
      capturedUrl = url;
      return { clips: [] };
    };

    await client.getStreamClips('test-mint', {
      limit: 15,
      clipType: 'HIGHLIGHT'
    });

    assert(capturedUrl.includes('limit=15'));
    assert(capturedUrl.includes('clipType=HIGHLIGHT'));
  });

  test('should create convenience methods correctly', async () => {
    const client = new PumpFunClient();

    let capturedUrl = '';
    client.makeRequest = async (url) => {
      capturedUrl = url;
      return { clips: [] };
    };

    // Test getCompleteStreams
    await client.getCompleteStreams('test-mint', 25);
    assert(capturedUrl.includes('limit=25'));
    assert(capturedUrl.includes('clipType=COMPLETE'));

    // Test getHighlightClips
    await client.getHighlightClips('test-mint', 30);
    assert(capturedUrl.includes('limit=30'));
    assert(capturedUrl.includes('clipType=HIGHLIGHT'));
  });
});

describe('Base URLs', () => {
  test('should have correct base URLs', () => {
    const client = new PumpFunClient();
    const expectedUrls = {
      main: 'https://frontend-api-v3.pump.fun',
      swap: 'https://swap-api.pump.fun',
      livestream: 'https://livestream-api.pump.fun',
      chat: 'https://chat-api-v1.pump.fun',
      web: 'https://pump.fun'
    };

    assert.deepStrictEqual(client.baseUrls, expectedUrls);
  });
});