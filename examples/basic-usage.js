import { createClient } from '../src/index.js';

// Initialize the client
const client = createClient({
  timeout: 30000 // 30 second timeout
});

async function demonstrateBasicUsage() {
  console.log('=== Pump.fun API Demo ===\n');

  try {
    // 1. Get currently live streaming coins
    console.log('1. Getting currently live coins...');
    const liveCoins = await client.getCurrentlyLiveCoins({
      limit: 10,
      includeNsfw: false
    });

    console.log(`Found ${liveCoins.length} live coins`);
    if (liveCoins.length > 0) {
      const firstCoin = liveCoins[0];
      console.log(`First live coin: ${firstCoin.name} (${firstCoin.symbol})`);
      console.log(`Market cap: $${firstCoin.market_cap.toLocaleString()}`);
      console.log(`Mint address: ${firstCoin.mint}`);
      console.log(`Currently live: ${firstCoin.is_currently_live}\n`);
    }

    // 2. Get SOL price
    console.log('2. Getting current SOL price...');
    const solPrice = await client.getSolPrice();
    console.log(`Current SOL price: $${solPrice.solPrice.toFixed(2)}\n`);

    // 3. If we have a live coin, get its livestream info
    if (liveCoins.length > 0) {
      const coinMint = liveCoins[0].mint;

      console.log(`3. Getting livestream status for ${coinMint}...`);
      try {
        const livestreamStatus = await client.getCurrentLivestream(coinMint);
        console.log('Livestream status:', JSON.stringify(livestreamStatus, null, 2));
      } catch (error) {
        console.log('No livestream status available:', error.message);
      }

      console.log(`4. Getting stream clips for ${coinMint}...`);
      try {
        const highlights = await client.getHighlightClips(coinMint, 5);
        console.log(`Found ${highlights.clips.length} highlight clips`);

        if (highlights.clips.length > 0) {
          const firstClip = highlights.clips[0];
          console.log(`First clip: ${firstClip.duration}s duration`);
          console.log(`Thumbnail: ${firstClip.thumbnailUrl}`);
          if (firstClip.mp4Url) {
            console.log(`MP4 URL: ${firstClip.mp4Url}`);
          }
        }
      } catch (error) {
        console.log('No clips available:', error.message);
      }

      console.log(`5. Checking creator livestream approval for ${coinMint}...`);
      try {
        const approvalStatus = await client.checkCreatorLivestreamApproval(coinMint);
        console.log('Creator approval status:', JSON.stringify(approvalStatus, null, 2));
      } catch (error) {
        console.log('Could not check approval status:', error.message);
      }

      console.log(`6. Getting chat invites for ${coinMint}...`);
      try {
        const chatInvites = await client.getCoinChatInvites(coinMint);
        console.log('Chat invites:', JSON.stringify(chatInvites, null, 2));
      } catch (error) {
        console.log('No chat invites available:', error.message);
      }
    }

    // 7. Get platform flags
    console.log('\n7. Getting platform flags...');
    try {
      const flags = await client.getPlatformFlags();
      console.log('Platform flags available:', Object.keys(flags).join(', '));
    } catch (error) {
      console.log('Could not fetch platform flags:', error.message);
    }

    console.log('\n=== Demo completed successfully ===');

  } catch (error) {
    console.error('Demo failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the demonstration
demonstrateBasicUsage();