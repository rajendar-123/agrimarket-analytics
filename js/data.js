// ============================================================
// AgriMarket Analytics — Agricultural Market Data Layer
// Generates realistic market records for AP & Telangana Mandis
// ============================================================

const SalesData = (() => {
  const states = ['Andhra Pradesh', 'Telangana'];
  
  const mandisByState = {
    'Andhra Pradesh': ['Guntur', 'Kurnool', 'Anantapur', 'Vijayawada', 'Adoni'],
    'Telangana': ['Warangal', 'Nizamabad', 'Khammam', 'Suryapet', 'Badepally']
  };

  const commodities = ['Paddy', 'Cotton', 'Chillies', 'Turmeric', 'Maize', 'Groundnut', 'Onions'];

  // Base parameters for commodities: [basePriceMin, basePriceMax, baseArrivalMin, baseArrivalMax]
  const commodityParams = {
    'Paddy': { minPrice: 2000, maxPrice: 2600, minArrival: 100, maxArrival: 400, unit: 'qtl' },
    'Cotton': { minPrice: 6200, maxPrice: 8500, minArrival: 80, maxArrival: 300, unit: 'qtl' },
    'Chillies': { minPrice: 14000, maxPrice: 22000, minArrival: 40, maxArrival: 150, unit: 'qtl' },
    'Turmeric': { minPrice: 6500, maxPrice: 10500, minArrival: 50, maxArrival: 180, unit: 'qtl' },
    'Maize': { minPrice: 1800, maxPrice: 2400, minArrival: 120, maxArrival: 350, unit: 'qtl' },
    'Groundnut': { minPrice: 5500, maxPrice: 7500, minArrival: 60, maxArrival: 200, unit: 'qtl' },
    'Onions': { minPrice: 1200, maxPrice: 3800, minArrival: 150, maxArrival: 500, unit: 'qtl' }
  };

  // Seeded random number generator for determinism
  function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  // Generate dataset for 2025 and first 5 months of 2026
  function generateData() {
    const data = [];
    let seed = 42;
    let idCounter = 1;

    const startDate = new Date('2025-01-01');
    const endDate = new Date('2026-05-31');

    // Generate weekly data points for each mandi and commodity to keep size reasonable but representative
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-11
      const dateStr = d.toISOString().split('T')[0];

      states.forEach(state => {
        const mandis = mandisByState[state];
        mandis.forEach(mandi => {
          commodities.forEach(commodity => {
            // Check if this crop is active in this mandi (to make it realistic)
            let isActive = false;
            if (commodity === 'Chillies' && (mandi === 'Guntur' || mandi === 'Khammam' || mandi === 'Warangal')) isActive = true;
            else if (commodity === 'Turmeric' && (mandi === 'Nizamabad' || mandi === 'Warangal' || mandi === 'Vijayawada')) isActive = true;
            else if (commodity === 'Onions' && (mandi === 'Kurnool' || mandi === 'Badepally')) isActive = true;
            else if (commodity === 'Groundnut' && (mandi === 'Anantapur' || mandi === 'Kurnool' || mandi === 'Badepally')) isActive = true;
            else if (commodity === 'Cotton' && (mandi === 'Warangal' || mandi === 'Adoni' || mandi === 'Khammam' || mandi === 'Guntur')) isActive = true;
            else if (commodity === 'Paddy') isActive = true; // Paddy is everywhere
            else if (commodity === 'Maize' && (mandi === 'Badepally' || mandi === 'Warangal' || mandi === 'Kurnool')) isActive = true;

            if (!isActive) return;

            // Generate values
            const params = commodityParams[commodity];
            
            // Introduce seasonal price & arrival modifiers
            let priceMod = 1.0;
            let arrivalMod = 1.0;

            // Seasonality rules
            if (commodity === 'Paddy') {
              // Kharif harvest (Nov-Dec): high arrival, lower price
              if (month === 10 || month === 11) { arrivalMod = 1.5; priceMod = 0.92; }
              // Rabi harvest (April-May): high arrival, lower price
              else if (month === 3 || month === 4) { arrivalMod = 1.4; priceMod = 0.94; }
              // Off season (Aug-Sept): low arrival, higher price
              else if (month === 7 || month === 8) { arrivalMod = 0.6; priceMod = 1.08; }
            } else if (commodity === 'Cotton') {
              // Peak harvest (Nov-Feb)
              if (month === 10 || month === 11 || month === 0 || month === 1) { arrivalMod = 1.6; priceMod = 0.90; }
              // Summer end (May-July)
              else if (month === 4 || month === 5 || month === 6) { arrivalMod = 0.5; priceMod = 1.15; }
            } else if (commodity === 'Chillies') {
              // Peak harvest in Guntur (Feb-April)
              if (month === 1 || month === 2 || month === 3) { arrivalMod = 1.8; priceMod = 0.88; }
              else if (month === 8 || month === 9 || month === 10) { arrivalMod = 0.4; priceMod = 1.20; }
            } else if (commodity === 'Turmeric') {
              // Peak harvest (Feb-April)
              if (month === 1 || month === 2 || month === 3) { arrivalMod = 1.7; priceMod = 0.90; }
              else if (month === 8 || month === 9 || month === 10) { arrivalMod = 0.5; priceMod = 1.15; }
            } else if (commodity === 'Onions') {
              // High volatility crop
              if (month === 8 || month === 9 || month === 10) { arrivalMod = 0.7; priceMod = 1.35; } // Onion crisis!
              else if (month === 0 || month === 1) { arrivalMod = 1.5; priceMod = 0.75; } // Glut!
            }

            // Year-over-year inflation trend (2026 prices slightly higher)
            if (year === 2026) {
              priceMod *= 1.06;
              arrivalMod *= 1.02;
            }

            const rand1 = seededRandom(seed++);
            const rand2 = seededRandom(seed++);
            const rand3 = seededRandom(seed++);

            // Compute arrivals in Metric Tons
            const arrivals = Math.round((params.minArrival + rand1 * (params.maxArrival - params.minArrival)) * arrivalMod);
            
            // Compute prices
            const priceSpread = params.maxPrice - params.minPrice;
            const minPrice = Math.round((params.minPrice + rand2 * (priceSpread * 0.4)) * priceMod);
            const maxPrice = Math.round((params.maxPrice - rand3 * (priceSpread * 0.4)) * priceMod);
            
            // Modal price (usually close to middle, slightly influenced by arrival volume - high arrivals pull price down)
            const volumeEffect = (arrivals / (params.maxArrival * arrivalMod)) * 0.1; // up to 10% dip for max volume
            const modalAvg = (minPrice + maxPrice) / 2;
            let modalPrice = Math.round(modalAvg * (1 - volumeEffect + (seededRandom(seed++) * 0.1 - 0.05)));

            // Clamp modal price between min and max
            modalPrice = Math.max(minPrice, Math.min(maxPrice, modalPrice));

            data.push({
              id: `TXN-${String(idCounter++).padStart(5, '0')}`,
              date: dateStr,
              year,
              month,
              mandi,
              state,
              commodity,
              arrivals, // MT
              minPrice, // INR/Qtl
              maxPrice, // INR/Qtl
              modalPrice // INR/Qtl
            });
          });
        });
      });
    }

    return data;
  }

  const rawData = generateData();

  // Helper filter function
  function filterRecords(state = 'All', mandi = 'All', commodity = 'All') {
    return rawData.filter(r => {
      if (state !== 'All' && r.state !== state) return false;
      if (mandi !== 'All' && r.mandi !== mandi) return false;
      if (commodity !== 'All' && r.commodity !== commodity) return false;
      return true;
    });
  }

  // --- Public API ---

  function getRawRecords() {
    return rawData;
  }

  function getStates() {
    return states;
  }

  function getMandis(state = 'All') {
    if (state === 'All') {
      return [...mandisByState['Andhra Pradesh'], ...mandisByState['Telangana']];
    }
    return mandisByState[state] || [];
  }

  function getCommodities() {
    return commodities;
  }

  // Fetch KPI statistics
  function getKPIs(state = 'All', mandi = 'All', commodity = 'All') {
    const filtered = filterRecords(state, mandi, commodity);
    if (filtered.length === 0) {
      return {
        avgPrice: { value: 0, change: 0 },
        totalArrivals: { value: 0, change: 0 },
        volatility: { value: 0, status: 'N/A' },
        topMandi: { name: 'None', value: 0 }
      };
    }

    // Split current vs previous period (e.g. 2026 vs 2025)
    const records2025 = filtered.filter(r => r.year === 2025);
    const records2026 = filtered.filter(r => r.year === 2026);

    const sumPrice = filtered.reduce((sum, r) => sum + r.modalPrice, 0);
    const avgPriceVal = sumPrice / filtered.length;

    // Price change percentage (2026 vs 2025)
    let priceChange = 0;
    if (records2025.length > 0 && records2026.length > 0) {
      const avg25 = records2025.reduce((sum, r) => sum + r.modalPrice, 0) / records2025.length;
      const avg26 = records2026.reduce((sum, r) => sum + r.modalPrice, 0) / records2026.length;
      priceChange = ((avg26 - avg25) / avg25 * 100);
    } else {
      // Fallback trend: last 4 weeks vs previous 4 weeks
      const sorted = [...filtered].sort((a,b) => b.date.localeCompare(a.date));
      const latest = sorted.slice(0, Math.min(10, sorted.length));
      const previous = sorted.slice(Math.min(10, sorted.length), Math.min(20, sorted.length));
      if (latest.length > 0 && previous.length > 0) {
        const avgLatest = latest.reduce((sum, r) => sum + r.modalPrice, 0) / latest.length;
        const avgPrev = previous.reduce((sum, r) => sum + r.modalPrice, 0) / previous.length;
        priceChange = ((avgLatest - avgPrev) / avgPrev * 100);
      }
    }

    // Total Arrivals
    const totalArrivalsVal = filtered.reduce((sum, r) => sum + r.arrivals, 0);
    let arrivalsChange = 0;
    if (records2025.length > 0 && records2026.length > 0) {
      const sum25 = records2025.reduce((sum, r) => sum + r.arrivals, 0);
      const sum26 = records2026.reduce((sum, r) => sum + r.arrivals, 0);
      // Adjust 2026 volume since it only has 5 months vs 12 months in 2025
      const adjusted25 = sum25 * (5/12); // scale down 2025 to 5 months for fair comparison
      arrivalsChange = ((sum26 - adjusted25) / adjusted25 * 100);
    }

    // Price Volatility (Coefficient of Variation: SD / Mean)
    const variance = filtered.reduce((sum, r) => sum + Math.pow(r.modalPrice - avgPriceVal, 2), 0) / filtered.length;
    const stdDev = Math.sqrt(variance);
    const volatilityVal = (stdDev / avgPriceVal) * 100;
    let volatilityStatus = 'Low';
    if (volatilityVal > 18) volatilityStatus = 'High Risk';
    else if (volatilityVal > 10) volatilityStatus = 'Moderate';

    // Top Mandi by volume
    const mandiVolumes = {};
    filtered.forEach(r => {
      mandiVolumes[r.mandi] = (mandiVolumes[r.mandi] || 0) + r.arrivals;
    });
    let topMandiName = 'N/A';
    let topMandiVol = 0;
    Object.keys(mandiVolumes).forEach(m => {
      if (mandiVolumes[m] > topMandiVol) {
        topMandiVol = mandiVolumes[m];
        topMandiName = m;
      }
    });

    return {
      avgPrice: { value: Math.round(avgPriceVal), change: priceChange.toFixed(1) },
      totalArrivals: { value: totalArrivalsVal, change: arrivalsChange.toFixed(1) },
      volatility: { value: volatilityVal.toFixed(1), status: volatilityStatus },
      topMandi: { name: topMandiName, value: topMandiVol }
    };
  }

  // Get monthly averages for 2025 and 3-month forecast
  function getPriceTrend(state = 'All', mandi = 'All', commodity = 'All') {
    const filtered = filterRecords(state, mandi, commodity);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Group 2025 data by month
    const monthlySum = Array(12).fill(0);
    const monthlyCount = Array(12).fill(0);

    filtered.forEach(r => {
      if (r.year === 2025) {
        monthlySum[r.month] += r.modalPrice;
        monthlyCount[r.month]++;
      }
    });

    const prices = monthlySum.map((sum, i) => {
      return monthlyCount[i] > 0 ? Math.round(sum / monthlyCount[i]) : null;
    });

    // Handle missing months by interpolation if any, otherwise default to baseline
    let lastValidPrice = 0;
    for (let i = 0; i < 12; i++) {
      if (prices[i] === null) {
        prices[i] = lastValidPrice || 3000;
      } else {
        lastValidPrice = prices[i];
      }
    }

    // Build a 3-month forecast (Jan 2026, Feb 2026, Mar 2026) using moving average
    // In our generated data, 2026 actually exists, but let's simulate a projection for visualization.
    // We will calculate a 3-month moving average from Sep-Dec 2025
    const last3Avg = (prices[9] + prices[10] + prices[11]) / 3;
    
    // Add seasonal adjustments to forecast (e.g. Chillies dip in Feb due to harvest, Paddy dips in Dec)
    let f1 = last3Avg * 1.02; // Jan
    let f2 = last3Avg * 0.96; // Feb
    let f3 = last3Avg * 0.94; // Mar

    if (commodity === 'Chillies' || commodity === 'Turmeric') {
      f2 = last3Avg * 0.90; // Harvest dip
      f3 = last3Avg * 0.88;
    } else if (commodity === 'Paddy') {
      f1 = last3Avg * 0.95;
      f2 = last3Avg * 0.98;
    }

    const labels = [...months, 'Jan 26 (F)', 'Feb 26 (F)', 'Mar 26 (F)'];
    const historical = [...prices, null, null, null];
    const forecast = [...Array(11).fill(null), prices[11], Math.round(f1), Math.round(f2), Math.round(f3)];

    return { labels, historical, forecast };
  }

  // Get monthly correlation between arrivals and prices
  function getArrivalsVsPrice(state = 'All', mandi = 'All', commodity = 'All') {
    const filtered = filterRecords(state, mandi, commodity);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyPriceSum = Array(12).fill(0);
    const monthlyPriceCount = Array(12).fill(0);
    const monthlyArrivalSum = Array(12).fill(0);

    filtered.forEach(r => {
      if (r.year === 2025) {
        monthlyPriceSum[r.month] += r.modalPrice;
        monthlyPriceCount[r.month]++;
        monthlyArrivalSum[r.month] += r.arrivals;
      }
    });

    const prices = monthlyPriceSum.map((sum, i) => {
      return monthlyPriceCount[i] > 0 ? Math.round(sum / monthlyPriceCount[i]) : 0;
    });

    return {
      labels: months,
      arrivals: monthlyArrivalSum, // Bar chart values (MT)
      prices: prices // Line chart values (₹/Qtl)
    };
  }

  // Get pricing across different mandis for comparison
  function getMandiComparison(state = 'All', commodity = 'All') {
    let activeMandis = getMandis(state);
    
    const mandiPrices = activeMandis.map(mandi => {
      const filtered = filterRecords(state, mandi, commodity);
      if (filtered.length === 0) return { mandi, price: 0 };
      const sum = filtered.reduce((s, r) => s + r.modalPrice, 0);
      return { mandi, price: Math.round(sum / filtered.length) };
    });

    // Filter out mandis with 0 trading volume for this crop
    const validComparisons = mandiPrices.filter(item => item.price > 0);
    
    return {
      labels: validComparisons.map(item => item.mandi),
      prices: validComparisons.map(item => item.price)
    };
  }

  // Get share of volume by commodity
  function getCommodityShare(state = 'All', mandi = 'All') {
    const filtered = filterRecords(state, mandi, 'All');
    const volumes = {};

    filtered.forEach(r => {
      volumes[r.commodity] = (volumes[r.commodity] || 0) + r.arrivals;
    });

    const labels = Object.keys(volumes);
    const data = labels.map(l => volumes[l]);

    const commodityColors = {
      'Paddy': '#10b981',     // Green
      'Cotton': '#38bdf8',    // Sky Blue
      'Chillies': '#ef4444',   // Red
      'Turmeric': '#f59e0b',   // Gold/Amber
      'Maize': '#eab308',      // Yellow
      'Groundnut': '#84cc16',  // Lime
      'Onions': '#ec4899'      // Pink
    };

    const colors = labels.map(l => commodityColors[l] || '#6b7280');

    return { labels, data, colors };
  }

  // Sparkline data generator for the last 10 records of selected filters
  function getSparklines(state = 'All', mandi = 'All', commodity = 'All') {
    const filtered = filterRecords(state, mandi, commodity);
    const sorted = [...filtered].sort((a,b) => a.date.localeCompare(b.date));
    const last12 = sorted.slice(-12);

    if (last12.length === 0) {
      return {
        price: Array(12).fill(0),
        arrivals: Array(12).fill(0),
        volatility: Array(12).fill(0),
        mandi: Array(12).fill(0)
      };
    }

    return {
      price: last12.map(r => r.modalPrice),
      arrivals: last12.map(r => r.arrivals),
      volatility: last12.map((r, i) => {
        // Mock rolling variance
        const slice = last12.slice(0, i + 1);
        const avg = slice.reduce((s, x) => s + x.modalPrice, 0) / slice.length;
        const v = slice.reduce((s, x) => s + Math.pow(x.modalPrice - avg, 2), 0) / slice.length;
        return Math.round(Math.sqrt(v));
      }),
      mandi: last12.map(r => r.arrivals)
    };
  }

  // Generates smart insights based on selected parameters
  function getInsights(state = 'All', mandi = 'All', commodity = 'All') {
    const insights = [];

    if (commodity === 'All') {
      insights.push("💡 **Diversified Market**: Paddy remains the dominant commodity by volume, contributing over 35% of total arrivals across both states.");
      insights.push("💡 **Inter-State Comparison**: Guntur mandi (AP) records the highest trading value due to high-value Chilli transactions, while Warangal (Telangana) leads in Cotton volume.");
      insights.push("💡 **Price Volatility**: Onion and Tomato prices exhibit high seasonal volatility, showing spikes in October-November coinciding with festival demand and crop supply delays.");
    } else {
      if (commodity === 'Chillies') {
        insights.push("🌶️ **Guntur Chilli Premium**: Guntur mandi registers a 15% price premium on Chilli varieties compared to Khammam due to export quality grading.");
        insights.push("🌶️ **Harvest Volatility**: Chilli arrivals are highly seasonal, peaking between February and April. Expect a temporary price relaxation of 8-12% during peak arrivals.");
      } else if (commodity === 'Turmeric') {
        insights.push("💛 **Nizamabad Turmeric Hub**: Nizamabad mandi dictates the national benchmark price for Turmeric. Turmeric modal prices currently trade around stable margins of ₹7,500 - ₹8,800/Qtl.");
        insights.push("💛 **Sowing Inferences**: Anticipated monsoon delays in Telangana might squeeze next year's Turmeric production, triggering early speculative buying by millers.");
      } else if (commodity === 'Paddy') {
        insights.push("🌾 **MSP Support**: Paddy prices remain anchored near the Government MSP of ~₹2,200 - ₹2,300/Qtl, ensuring stable returns for farmers with minimal market risk.");
        insights.push("🌾 **Harvest Glut**: Massive arrivals in November/December (Kharif harvest) create warehousing constraints in Suryapet and Vijayawada mandis.");
      } else if (commodity === 'Cotton') {
        insights.push("⚪ **Global Demand Impact**: Cotton modal prices in Warangal are trading strong at ~₹7,800/Qtl, supported by strong demand from textile export houses in southern states.");
        insights.push("⚪ **Volume Seasonality**: Over 70% of Cotton arrivals are concentrated between November and February. Trading volumes typically drop drastically from March onwards.");
      } else if (commodity === 'Onions') {
        insights.push("🧅 **Supply Shortages**: Kurnool onion markets are seeing daily modal prices hovering near ₹3,200/Qtl due to unseasonal rain damage to the late-kharif nurseries.");
        insights.push("🧅 **Risk Profile**: Onion trading has a High-Risk volatility index of 24.5%. Prices can fluctuate up to 50% within a 30-day window based on storage arrivals.");
      } else {
        insights.push(`🌾 **Market Summary**: ${commodity} trading volume remains healthy across active markets with a steady standard deviation, reflecting predictable local demand.`);
      }
    }

    // State specific
    if (state === 'Andhra Pradesh') {
      insights.push("📍 **AP Infra Advantage**: AP's coastal connectivity and cold-storage infrastructure in Guntur and Vijayawada help stabilize perishable commodity spikes.");
    } else if (state === 'Telangana') {
      insights.push("📍 **Telangana Procurement**: State-backed Paddy procurement centers (IKP centers) in Suryapet and Nizamabad keep mandi arrivals regular and help check distress selling.");
    }

    return insights;
  }

  return {
    getRawRecords,
    getStates,
    getMandis,
    getCommodities,
    getKPIs,
    getPriceTrend,
    getArrivalsVsPrice,
    getMandiComparison,
    getCommodityShare,
    getSparklines,
    getInsights
  };
})();
