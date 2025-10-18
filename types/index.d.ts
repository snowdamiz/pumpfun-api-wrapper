/**
 * Pump.fun API TypeScript Definitions
 */

export interface LiveCoin {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image_uri: string;
  metadata_uri: string;
  twitter: string | null;
  telegram: string | null;
  bonding_curve: string;
  associated_bonding_curve: string;
  creator: string;
  created_timestamp: number;
  raydium_pool: string | null;
  complete: boolean;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  hidden: boolean | null;
  total_supply: number;
  website: string | null;
  show_name: boolean;
  last_trade_timestamp: number;
  king_of_the_hill_timestamp: number | null;
  market_cap: number;
  nsfw: boolean;
  market_id: string | null;
  inverted: boolean | null;
  real_sol_reserves: number;
  real_token_reserves: number;
  livestream_ban_expiry: number;
  last_reply: number | null;
  reply_count: number;
  is_banned: boolean;
  is_currently_live: boolean;
  initialized: boolean;
  video_uri: string | null;
  updated_at: number;
  pump_swap_pool: string | null;
  ath_market_cap: number;
  ath_market_cap_timestamp: number;
  banner_uri: string | null;
  hide_banner: boolean;
  livestream_downrank_score: number;
  program: string;
  platform: string | null;
  thumbnail: string;
  num_participants: number;
  downrank_score: number;
  usd_market_cap: number;
  livestream_title: string | null;
}

export interface StreamClip {
  roomName: string;
  clipId: string;
  sessionId: string;
  startTime: string;
  endTime: string;
  duration: number;
  playlistUrl?: string;
  mp4Url?: string;
  mp4S3Key: string;
  mp4SizeBytes: number;
  mp4CreatedAt: string;
  thumbnailUrl: string;
  thumbnailS3Key: string;
  playlistS3Key: string;
  hidden: boolean;
  clipType: 'COMPLETE' | 'HIGHLIGHT';
  createdAt: string;
  highlightCreatorAddress?: string;
}

export interface ClipsResponse {
  clips: StreamClip[];
}

export interface SolPriceResponse {
  solPrice: number;
}

export interface CreatorApprovalResponse {
  // Response type may vary, using generic object for flexibility
  [key: string]: any;
}

export interface LivestreamStatusResponse {
  // Response type may vary, using generic object for flexibility
  [key: string]: any;
}

export interface ChatInviteResponse {
  // Response type may vary, using generic object for flexibility
  [key: string]: any;
}

export interface PlatformFlagsResponse {
  // Response type may vary, using generic object for flexibility
  [key: string]: any;
}

export interface DownloadResult {
  success: boolean;
  path?: string;
  size?: number;
  duration?: number;
  clip?: StreamClip;
  error?: string;
}

export interface DownloadProgress {
  (progress: number, downloaded: number, total: number): void;
}

export interface DownloadOptions {
  onProgress?: DownloadProgress;
  timeout?: number;
  ffmpegPath?: string;
}

export interface MultiDownloadOptions extends DownloadOptions {
  concurrency?: number;
  filenameGenerator?: (clip: StreamClip, index: number) => string;
}

export interface ClipDownloadInfo {
  downloadUrl: string;
  estimatedSize: number | null;
  type: 'COMPLETE' | 'HIGHLIGHT';
  duration: number;
  format: 'HLS' | 'MP4';
  requiresFfmpeg: boolean;
}

export interface CurrentlyLiveCoinsParams {
  offset?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  includeNsfw?: boolean;
}

export interface StreamClipsParams {
  limit?: number;
  clipType: 'COMPLETE' | 'HIGHLIGHT';
}

export interface ClientOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

export declare class PumpFunClient {
  constructor(options?: ClientOptions);

  makeRequest(url: string, options?: RequestInit): Promise<any>;

  getCurrentlyLiveCoins(params?: CurrentlyLiveCoinsParams): Promise<LiveCoin[]>;

  getStreamClips(mintId: string, params: StreamClipsParams): Promise<ClipsResponse>;

  getCompleteStreams(mintId: string, limit?: number): Promise<ClipsResponse>;

  getHighlightClips(mintId: string, limit?: number): Promise<ClipsResponse>;

  checkCreatorLivestreamApproval(mintId: string): Promise<CreatorApprovalResponse>;

  getCurrentLivestream(mintId: string): Promise<LivestreamStatusResponse>;

  getCoinChatInvites(mintId: string): Promise<ChatInviteResponse>;

  getSolPrice(): Promise<SolPriceResponse>;

  getPlatformFlags(): Promise<PlatformFlagsResponse>;

  downloadHighlightClip(clipData: StreamClip, outputPath: string, options?: DownloadOptions): Promise<DownloadResult>;

  downloadHighlightClips(clips: StreamClip[], outputDir: string, options?: MultiDownloadOptions): Promise<DownloadResult[]>;

  downloadThumbnail(clipData: StreamClip, outputPath: string, options?: Pick<DownloadOptions, 'timeout'>): Promise<DownloadResult>;

  downloadCompleteStream(clipData: StreamClip, outputPath: string, options?: DownloadOptions): Promise<DownloadResult>;

  downloadClip(clipData: StreamClip, outputPath: string, options?: DownloadOptions): Promise<DownloadResult>;

  getClipDownloadInfo(clipData: StreamClip): Promise<ClipDownloadInfo>;
}

export declare function createClient(options?: ClientOptions): PumpFunClient;

export declare const client: PumpFunClient;

export declare const getCurrentlyLiveCoins: PumpFunClient['getCurrentlyLiveCoins'];
export declare const getStreamClips: PumpFunClient['getStreamClips'];
export declare const getCompleteStreams: PumpFunClient['getCompleteStreams'];
export declare const getHighlightClips: PumpFunClient['getHighlightClips'];
export declare const checkCreatorLivestreamApproval: PumpFunClient['checkCreatorLivestreamApproval'];
export declare const getCurrentLivestream: PumpFunClient['getCurrentLivestream'];
export declare const getCoinChatInvites: PumpFunClient['getCoinChatInvites'];
export declare const getSolPrice: PumpFunClient['getSolPrice'];
export declare const getPlatformFlags: PumpFunClient['getPlatformFlags'];
export declare const downloadHighlightClip: PumpFunClient['downloadHighlightClip'];
export declare const downloadHighlightClips: PumpFunClient['downloadHighlightClips'];
export declare const downloadThumbnail: PumpFunClient['downloadThumbnail'];
export declare const downloadCompleteStream: PumpFunClient['downloadCompleteStream'];
export declare const downloadClip: PumpFunClient['downloadClip'];
export declare const getClipDownloadInfo: PumpFunClient['getClipDownloadInfo'];