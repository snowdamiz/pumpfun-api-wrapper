import { createClient } from '../src/index.js';

// Initialize client with custom options
const client = createClient({
  timeout: 60000, // 60 second timeout
  headers: {
    'User-Agent': 'My-PumpFun-Client/1.0'
  }
});

/**
 * Advanced usage examples with pagination and error handling
 */
async function advancedExamples() {
  console.log('=== Advanced Pump.fun API Examples ===\n');

  // Example 1: Paginated results
  console.log('1. Paginated live coins retrieval...');
  try {
    let allCoins = [];
    let offset = 0;
    const limit = 20;
    let hasMore = true;

    while (hasMore && allCoins.length < 100) {
      console.log(`Fetching coins at offset ${offset}...`);

      const coins = await client.getCurrentlyLiveCoins({
        offset,
        limit,
        includeNsfw: false
      });

      if (coins.length === 0) {
        hasMore = false;
      } else {
        allCoins = allCoins.concat(coins);
        offset += limit;
        console.log(`Retrieved ${coins.length} coins, total: ${allCoins.length}`);
      }
    }

    console.log(`\nTotal live coins found: ${allCoins.length}`);

    // Filter and sort by market cap
    const highCapCoins = allCoins
      .filter(coin => coin.market_cap > 50000)
      .sort((a, b) => b.market_cap - a.market_cap)
      .slice(0, 10);

    console.log('\nTop 10 coins by market cap (> $50,000):');
    highCapCoins.forEach((coin, index) => {
      console.log(`${index + 1}. ${coin.name} (${coin.symbol}) - $${coin.market_cap.toLocaleString()}`);
    });

  } catch (error) {
    console.error('Pagination example failed:', error.message);
  }

  // Example 2: Batch processing multiple tokens
  console.log('\n\n2. Batch processing token data...');
  try {
    // Get some live coins first
    const liveCoins = await client.getCurrentlyLiveCoins({ limit: 5 });

    if (liveCoins.length > 0) {
      console.log(`Processing data for ${liveCoins.length} tokens...`);

      // Process each token's additional data
      for (const coin of liveCoins) {
        console.log(`\nProcessing: ${coin.name} (${coin.mint})`);

        try {
          // Get livestream status
          const livestreamStatus = await client.getCurrentLivestream(coin.mint);
          console.log(`  Livestream available: ${livestreamStatus ? 'Yes' : 'No'}`);
        } catch (err) {
          console.log(`  Livestream: Not available`);
        }

        try {
          // Get creator approval
          const approval = await client.checkCreatorLivestreamApproval(coin.mint);
          console.log(`  Creator livestream approved: ${approval.is_approved || 'Unknown'}`);
        } catch (err) {
          console.log(`  Creator approval: Not available`);
        }

        try {
          // Get highlight clips
          const clips = await client.getHighlightClips(coin.mint, 3);
          console.log(`  Highlight clips: ${clips.clips.length} available`);

          clips.clips.forEach((clip, index) => {
            console.log(`    Clip ${index + 1}: ${clip.duration}s (${clip.clipType})`);
          });
        } catch (err) {
          console.log(`  Clips: Not available`);
        }
      }
    }
  } catch (error) {
    console.error('Batch processing failed:', error.message);
  }

  // Example 3: Real-time monitoring simulation
  console.log('\n\n3. Simulating real-time monitoring...');
  try {
    const monitorToken = async (mintId, intervalMs = 5000) => {
      console.log(`Starting monitoring for token: ${mintId}`);
      console.log('Press Ctrl+C to stop monitoring');

      const monitor = setInterval(async () => {
        try {
          const [livestreamStatus, solPrice] = await Promise.all([
            client.getCurrentLivestream(mintId),
            client.getSolPrice()
          ]);

          console.log(`[${new Date().toISOString()}] Monitoring ${mintId}:`);
          console.log(`  SOL Price: $${solPrice.solPrice.toFixed(2)}`);
          console.log(`  Livestream Status: ${livestreamStatus ? 'Active' : 'Inactive'}`);
        } catch (error) {
          console.log(`[${new Date().toISOString()}] Error monitoring: ${error.message}`);
        }
      }, intervalMs);

      // Return cleanup function
      return () => clearInterval(monitor);
    };

    // Note: In a real application, you would run this longer
    // For demo purposes, we'll just show the setup
    if (liveCoins.length > 0) {
      console.log(`Would start monitoring: ${liveCoins[0].mint}`);
      console.log('(Monitoring disabled in demo)');
    }

  } catch (error) {
    console.error('Monitoring setup failed:', error.message);
  }

  // Example 4: Error handling and retry logic
  console.log('\n\n4. Demonstrating robust error handling...');
  try {
    const fetchWithRetry = async (fetchFunction, maxRetries = 3) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Attempt ${attempt} of ${maxRetries}...`);
          const result = await fetchFunction();
          console.log('Success!');
          return result;
        } catch (error) {
          console.log(`Attempt ${attempt} failed: ${error.message}`);

          if (attempt === maxRetries) {
            throw error;
          }

          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };

    // Use with a potentially unreliable endpoint
    await fetchWithRetry(() => client.getSolPrice(), 3);

  } catch (error) {
    console.error('Retry mechanism failed:', error.message);
  }

  console.log('\n=== Advanced examples completed ===');
}

// Run advanced examples
advancedExamples().catch(console.error);