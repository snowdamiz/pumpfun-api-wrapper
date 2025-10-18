import { PumpFunClient } from './client.js';

export { PumpFunClient };

/**
 * Convenience function to create a new client instance
 */
export function createClient(options = {}) {
  return new PumpFunClient(options);
}

/**
 * Default client instance
 */
export const client = new PumpFunClient();

// Export all methods for easier usage
export const {
  getCurrentlyLiveCoins,
  getStreamClips,
  getCompleteStreams,
  getHighlightClips,
  checkCreatorLivestreamApproval,
  getCurrentLivestream,
  getCoinChatInvites,
  getSolPrice,
  getPlatformFlags,
  downloadHighlightClip,
  downloadHighlightClips,
  downloadCompleteStream,
  downloadClip,
  downloadThumbnail,
  getClipDownloadInfo
} = client;