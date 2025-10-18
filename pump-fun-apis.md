# Pump.fun Public API Documentation

## Overview
This document documents the public APIs discovered on Pump.fun (https://pump.fun) that provide access to live streaming tokens and other useful data.

## Base URLs
- Main API: `https://frontend-api-v3.pump.fun`
- Swap API: `https://swap-api.pump.fun`
- Livestream API: `https://livestream-api.pump.fun`
- Chat API: `https://chat-api-v1.pump.fun`

## 1. Live Streaming Coins API

### Get Currently Live Coins
**Endpoint:** `GET /coins/currently-live`

**Description:** Returns a list of coins that are currently livestreaming on the platform.

**Base URL:** `https://frontend-api-v3.pump.fun`

**Parameters:**
- `offset` (integer, default: 0): Number of items to skip for pagination
- `limit` (integer, default: 60): Number of items to return (max appears to be 60)
- `sort` (string, default: "currently_live"): Sort field
- `order` (string, default: "DESC"): Sort order (ASC/DESC)
- `includeNsfw` (boolean, default: false): Include NSFW content

**Example Request:**
```
GET https://frontend-api-v3.pump.fun/coins/currently-live?offset=0&limit=60&sort=currently_live&order=DESC&includeNsfw=false
```

**Response Structure:**
```json
[
  {
    "mint": "string (Solana token mint address)",
    "name": "string (coin name)",
    "symbol": "string (ticker symbol)",
    "description": "string (coin description)",
    "image_uri": "string (IPFS image URL)",
    "metadata_uri": "string (IPFS metadata URL)",
    "twitter": "string|null (Twitter URL)",
    "telegram": "string|null (Telegram URL)",
    "bonding_curve": "string (bonding curve address)",
    "associated_bonding_curve": "string (associated bonding curve)",
    "creator": "string (creator wallet address)",
    "created_timestamp": "integer (Unix timestamp)",
    "raydium_pool": "string|null (Raydium pool address)",
    "complete": "boolean",
    "virtual_sol_reserves": "integer",
    "virtual_token_reserves": "integer",
    "hidden": "boolean|null",
    "total_supply": "integer",
    "website": "string|null",
    "show_name": "boolean",
    "last_trade_timestamp": "integer",
    "king_of_the_hill_timestamp": "integer|null",
    "market_cap": "number (USD market cap)",
    "nsfw": "boolean",
    "market_id": "string|null",
    "inverted": "boolean|null",
    "real_sol_reserves": "integer",
    "real_token_reserves": "integer",
    "livestream_ban_expiry": "integer",
    "last_reply": "integer|null",
    "reply_count": "integer",
    "is_banned": "boolean",
    "is_currently_live": "boolean",
    "initialized": "boolean",
    "video_uri": "string|null",
    "updated_at": "integer",
    "pump_swap_pool": "string|null",
    "ath_market_cap": "number (all-time high market cap)",
    "ath_market_cap_timestamp": "integer",
    "banner_uri": "string|null",
    "hide_banner": "boolean",
    "livestream_downrank_score": "integer",
    "program": "string",
    "platform": "string|null",
    "thumbnail": "string (thumbnail URL)",
    "num_participants": "integer",
    "downrank_score": "integer",
    "usd_market_cap": "number (USD market cap)",
    "livestream_title": "string|null (livestream title)"
  }
]
```

## 2. Livestream Clips and Highlights APIs

### Get Stream Clips (Complete Streams)
**Endpoint:** `GET /clips/{mintId}`

**Description:** Returns complete recorded livestream sessions for a specific token.

**Base URL:** `https://livestream-api.pump.fun`

**Parameters:**
- `mintId` (string, required): The Solana token mint address
- `limit` (integer, default: 20): Number of clips to return
- `clipType` (string, required): Use "COMPLETE" for full stream recordings

**Example Request:**
```
GET https://livestream-api.pump.fun/clips/43yfnktSfyKkPXRLyevHu8rNXwWHxTXS1ntQbeArpump?limit=20&clipType=COMPLETE
```

**Response Structure:**
```json
{
  "clips": [
    {
      "roomName": "string (token mint address)",
      "clipId": "string (unique clip identifier)",
      "sessionId": "string (stream session identifier)",
      "startTime": "string (ISO 8601 datetime)",
      "endTime": "string (ISO 8601 datetime)",
      "duration": "integer (duration in seconds)",
      "playlistUrl": "string (HLS playlist URL for streaming)",
      "mp4S3Key": "string (S3 key for MP4 file, empty if not processed)",
      "mp4SizeBytes": "integer (MP4 file size in bytes)",
      "mp4CreatedAt": "string (MP4 creation timestamp)",
      "thumbnailUrl": "string (thumbnail image URL)",
      "thumbnailS3Key": "string (S3 key for thumbnail)",
      "playlistS3Key": "string (S3 key for HLS playlist)",
      "hidden": "boolean",
      "clipType": "COMPLETE",
      "createdAt": "string (ISO 8601 datetime)"
    }
  ]
}
```

### Get Stream Highlights
**Endpoint:** `GET /clips/{mintId}`

**Description:** Returns short highlight clips from livestreams for a specific token.

**Base URL:** `https://livestream-api.pump.fun`

**Parameters:**
- `mintId` (string, required): The Solana token mint address
- `limit` (integer, default: 20): Number of clips to return
- `clipType` (string, required): Use "HIGHLIGHT" for highlight clips

**Example Request:**
```
GET https://livestream-api.pump.fun/clips/43yfnktSfyKkPXRLyevHu8rNXwWHxTXS1ntQbeArpump?limit=20&clipType=HIGHLIGHT
```

**Response Structure:**
```json
{
  "clips": [
    {
      "roomName": "string (token mint address)",
      "clipId": "string (unique clip identifier)",
      "sessionId": "string (stream session identifier)",
      "startTime": "string (ISO 8601 datetime)",
      "endTime": "string (ISO 8601 datetime)",
      "duration": "integer (duration in seconds)",
      "mp4Url": "string (direct MP4 download URL)",
      "mp4S3Key": "string (S3 key for MP4 file)",
      "mp4SizeBytes": "integer (MP4 file size in bytes)",
      "mp4CreatedAt": "string (MP4 creation timestamp)",
      "thumbnailUrl": "string (thumbnail image URL)",
      "thumbnailS3Key": "string (S3 key for thumbnail)",
      "playlistS3Key": "string (S3 key for HLS playlist)",
      "hidden": "boolean",
      "clipType": "HIGHLIGHT",
      "createdAt": "string (ISO 8601 datetime)",
      "highlightCreatorAddress": "string (wallet address of user who created highlight)"
    }
  ]
}
```

### Check Livestream Creator Status
**Endpoint:** `GET /livestream/is-approved-creator`

**Description:** Checks if a token's creator is approved for livestreaming.

**Base URL:** `https://livestream-api.pump.fun`

**Parameters:**
- `mintId` (string, required): The Solana token mint address

**Example Request:**
```
GET https://livestream-api.pump.fun/livestream/is-approved-creator?mintId=43yfnktSfyKkPXRLyevHu8rNXwWHxTXS1ntQbeArpump
```

### Get Current Livestream Status
**Endpoint:** `GET /livestream`

**Description:** Gets current livestream information for a token.

**Base URL:** `https://livestream-api.pump.fun`

**Parameters:**
- `mintId` (string, required): The Solana token mint address

**Example Request:**
```
GET https://livestream-api.pump.fun/livestream?mintId=43yfnktSfyKkPXRLyevHu8rNXwWHxTXS1ntQbeArpump
```

## 3. Chat and Social APIs

### Get Coin Chat Invites
**Endpoint:** `GET /invites/coin/{mintId}`

**Description:** Returns chat invite information for a specific token.

**Base URL:** `https://chat-api-v1.pump.fun`

**Parameters:**
- `mintId` (string, required): The Solana token mint address

**Example Request:**
```
GET https://chat-api-v1.pump.fun/invites/coin/43yfnktSfyKkPXRLyevHu8rNXwWHxTXS1ntQbeArpump
```

## 4. Market Data APIs

### Solana Price
**Endpoint:** `GET /sol-price`

**Description:** Returns the current SOL price in USD.

**Base URL:** `https://frontend-api-v3.pump.fun`

**Example Request:**
```
GET https://frontend-api-v3.pump.fun/sol-price
```

**Response Structure:**
```json
{
  "solPrice": "number (current SOL price in USD)"
}
```

**Example Response:**
```json
{
  "solPrice": 187.66
}
```

### Flags API
**Endpoint:** `GET /api/flags`

**Description:** Returns platform flags and configuration data.

**Base URL:** `https://pump.fun`

**Example Request:**
```
GET https://pump.fun/api/flags
```

## 5. Pagination

The live streaming API supports pagination. To get more results, increase the `offset` parameter:

- First page: `offset=0&limit=60`
- Second page: `offset=60&limit=60`
- Third page: `offset=120&limit=60`
- And so on...

The clips API also supports pagination using the `limit` parameter to control the number of clips returned.

## 6. CORS and Rate Limiting

- The APIs appear to be CORS-enabled for requests from `https://pump.fun`
- Standard rate limiting may apply
- Include `Origin: https://pump.fun` header for better compatibility

## 7. Usage Examples

### Get first 60 live streaming coins
```bash
curl "https://frontend-api-v3.pump.fun/coins/currently-live?offset=0&limit=60&sort=currently_live&order=DESC&includeNsfw=false" \
  -H "Origin: https://pump.fun" \
  -H "accept: */*"
```

### Get current SOL price
```bash
curl "https://frontend-api-v3.pump.fun/sol-price" \
  -H "Origin: https://pump.fun" \
  -H "accept: */*"
```

### Get next page of live streaming coins
```bash
curl "https://frontend-api-v3.pump.fun/coins/currently-live?offset=60&limit=60&sort=currently_live&order=DESC&includeNsfw=false" \
  -H "Origin: https://pump.fun" \
  -H "accept: */*"
```

### Get complete stream recordings for a token
```bash
curl "https://livestream-api.pump.fun/clips/43yfnktSfyKkPXRLyevHu8rNXwWHxTXS1ntQbeArpump?limit=10&clipType=COMPLETE" \
  -H "accept: application/json"
```

### Get highlight clips for a token
```bash
curl "https://livestream-api.pump.fun/clips/43yfnktSfyKkPXRLyevHu8rNXwWHxTXS1ntQbeArpump?limit=10&clipType=HIGHLIGHT" \
  -H "accept: application/json"
```

### Check if creator is approved for livestreaming
```bash
curl "https://livestream-api.pump.fun/livestream/is-approved-creator?mintId=43yfnktSfyKkPXRLyevHu8rNXwWHxTXS1ntQbeArpump" \
  -H "accept: application/json"
```

### Get chat invite information
```bash
curl "https://chat-api-v1.pump.fun/invites/coin/43yfnktSfyKkPXRLyevHu8rNXwWHxTXS1ntQbeArpump" \
  -H "accept: application/json"
```

## 8. Clip Formats and URLs

### Complete Streams (clipType=COMPLETE)
- **Format**: HLS (HTTP Live Streaming)
- **URL Field**: `playlistUrl` contains the `.m3u8` playlist URL
- **Streaming**: Use HLS-compatible player to stream the complete recording
- **Thumbnails**: Available via `thumbnailUrl`
- **Duration**: Typically full stream sessions (30 minutes to several hours)

### Highlight Clips (clipType=HIGHLIGHT)
- **Format**: Direct MP4 download
- **URL Field**: `mp4Url` contains the direct MP4 file URL
- **Streaming**: Can be played directly or downloaded
- **Thumbnails**: Available via `thumbnailUrl`
- **Duration**: Short clips (typically 10-60 seconds)
- **Metadata**: Includes `highlightCreatorAddress` showing who created the highlight

### URL Patterns
- Complete stream HLS: `https://clips.pump.fun/{mintId}/clips/{clipId}/playlist.m3u8`
- Highlight MP4: `https://clips.pump.fun/{mintId}/clips/{clipId}/clip.mp4`
- Thumbnails: `https://clips.pump.fun/{mintId}/clips/{clipId}/thumbnail.jpg`

## 9. Data Fields of Interest

For live streaming tokens, these fields are particularly useful:

- `is_currently_live`: `true` for currently livestreaming coins
- `livestream_title`: The title of the livestream
- `market_cap`: Current market cap in USD
- `usd_market_cap`: Alternative USD market cap field
- `ath_market_cap`: All-time high market cap
- `num_participants`: Number of participants
- `reply_count`: Number of replies/comments
- `symbol`: Token ticker symbol
- `name`: Full token name
- `creator`: Creator wallet address
- `mint`: Solana token mint address

## 10. Notes

- All timestamps are in Unix timestamp format or ISO 8601 format for clips
- Market caps are in USD
- Image and metadata URLs use IPFS
- Some fields may be `null` depending on the token's status
- The platform appears to focus on Solana-based tokens
- Live streaming feature allows token creators to broadcast while trading
- Complete stream clips use HLS format for efficient streaming of long videos
- Highlight clips are processed and available as direct MP4 downloads
- Clip processing may take time after stream ends (mp4CreatedAt field shows processing time)
- Both COMPLETE and HIGHLIGHT clips include thumbnail images for preview

## 11. Discovered Date

APIs documented on: October 18, 2025

## 12. Disclaimer

This documentation is based on publicly accessible API endpoints discovered through browser network traffic analysis. Use these APIs responsibly and in accordance with Pump.fun's terms of service.