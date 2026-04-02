// app/api/zakat-prices/route.js
// Fetches live gold and silver prices and computes Nisaab in BDT
import { NextResponse } from 'next/server';

// Nisaab thresholds in Islam
const GOLD_NISAB_GRAMS = 85;     // 7.5 tola = 85 grams
const SILVER_NISAB_GRAMS = 595;  // 52.5 tola = 595 grams
const ZAKAT_RATE = 0.025;        // 2.5%

// Fallback prices (approximate current BDT prices per gram)
const FALLBACK = {
  goldPricePerGram: 9800,    // ~৳9,800/gram gold
  silverPricePerGram: 130,   // ~৳130/gram silver
  source: 'fallback',
};

export async function GET() {
  try {
    // Try goldapi.io (free tier: 300 requests/month)
    // If you have an API key, set GOLD_API_KEY in .env.local
    const apiKey = process.env.GOLD_API_KEY;

    let goldPricePerGram = FALLBACK.goldPricePerGram;
    let silverPricePerGram = FALLBACK.silverPricePerGram;
    let source = 'fallback';
    let usdToBdt = 121; // approximate USD to BDT exchange rate

    // Try fetching from a free exchange rate API for USD→BDT
    try {
      const fxRes = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD',
        { next: { revalidate: 86400 } } // cache 24 hours
      );
      if (fxRes.ok) {
        const fxData = await fxRes.json();
        usdToBdt = fxData.rates?.BDT || 121;
      }
    } catch (e) {
      console.warn('Exchange rate fetch failed:', e.message);
    }

    // Try fetching gold prices from metals-api or fallback API
    if (apiKey) {
      try {
        const goldRes = await fetch(
          'https://www.goldapi.io/api/XAU/USD',
          {
            headers: { 'x-access-token': apiKey },
            next: { revalidate: 3600 },
          }
        );
        if (goldRes.ok) {
          const goldData = await goldRes.json();
          // goldData.price is per troy ounce (31.1035 grams)
          const goldPerOzUsd = goldData.price;
          goldPricePerGram = (goldPerOzUsd / 31.1035) * usdToBdt;
          source = 'goldapi.io';
        }
      } catch (e) {
        console.warn('Gold API fetch failed:', e.message);
      }

      try {
        const silverRes = await fetch(
          'https://www.goldapi.io/api/XAG/USD',
          {
            headers: { 'x-access-token': apiKey },
            next: { revalidate: 3600 },
          }
        );
        if (silverRes.ok) {
          const silverData = await silverRes.json();
          const silverPerOzUsd = silverData.price;
          silverPricePerGram = (silverPerOzUsd / 31.1035) * usdToBdt;
          source = 'goldapi.io';
        }
      } catch (e) {
        console.warn('Silver API fetch failed:', e.message);
      }
    }

    // If no API key, try free metals price from alternative API
    if (source === 'fallback') {
      try {
        const metalsRes = await fetch(
          'https://api.metalpriceapi.com/v1/latest?api_key=demo&base=USD&currencies=XAU,XAG',
          { next: { revalidate: 3600 } }
        );
        if (metalsRes.ok) {
          const metalsData = await metalsRes.json();
          if (metalsData.rates) {
            // XAU rate is USD per 1 troy ounce (inverted in some APIs)
            if (metalsData.rates.XAU) {
              const goldPerOz = metalsData.rates.USDXAU || (1 / metalsData.rates.XAU);
              goldPricePerGram = (goldPerOz / 31.1035) * usdToBdt;
              source = 'metalpriceapi';
            }
            if (metalsData.rates.XAG) {
              const silverPerOz = metalsData.rates.USDXAG || (1 / metalsData.rates.XAG);
              silverPricePerGram = (silverPerOz / 31.1035) * usdToBdt;
            }
          }
        }
      } catch (e) {
        console.warn('Metals API fetch failed, using fallback:', e.message);
      }
    }

    const goldNisab = Math.round(GOLD_NISAB_GRAMS * goldPricePerGram);
    const silverNisab = Math.round(SILVER_NISAB_GRAMS * silverPricePerGram);

    return NextResponse.json({
      source,
      currency: 'BDT',
      exchangeRate: { USD_BDT: Math.round(usdToBdt * 100) / 100 },
      gold: {
        pricePerGram: Math.round(goldPricePerGram),
        nisabGrams: GOLD_NISAB_GRAMS,
        nisabTola: 7.5,
        nisabValue: goldNisab,
      },
      silver: {
        pricePerGram: Math.round(silverPricePerGram),
        nisabGrams: SILVER_NISAB_GRAMS,
        nisabTola: 52.5,
        nisabValue: silverNisab,
      },
      zakatRate: ZAKAT_RATE,
      lastUpdated: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Zakat prices error:', e);
    // Return fallback on any error
    return NextResponse.json({
      source: 'fallback',
      currency: 'BDT',
      gold: {
        pricePerGram: FALLBACK.goldPricePerGram,
        nisabGrams: GOLD_NISAB_GRAMS,
        nisabTola: 7.5,
        nisabValue: GOLD_NISAB_GRAMS * FALLBACK.goldPricePerGram,
      },
      silver: {
        pricePerGram: FALLBACK.silverPricePerGram,
        nisabGrams: SILVER_NISAB_GRAMS,
        nisabTola: 52.5,
        nisabValue: SILVER_NISAB_GRAMS * FALLBACK.silverPricePerGram,
      },
      zakatRate: ZAKAT_RATE,
      lastUpdated: new Date().toISOString(),
    });
  }
}
