// ============================================================
// AgriMarket Analytics — KPI Animations & Sparklines
// ============================================================

const KPI = (() => {

  // --- Animated count-up ---
  function animateValue(element, start, end, duration, prefix = '', suffix = '', decimals = 0) {
    const range = end - start;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (range * easedProgress);

      let valueFormatted;
      if (decimals > 0) {
        valueFormatted = current.toFixed(decimals);
      } else {
        valueFormatted = Math.round(current).toLocaleString();
      }

      element.textContent = prefix + valueFormatted + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // --- Draw mini sparkline inside KPI cards using HTML5 Canvas ---
  function drawSparkline(canvasId, data, color = '#10b981') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const padding = 3;

    if (data.length === 0 || data.every(v => v === 0)) {
      ctx.clearRect(0, 0, width, height);
      return;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const stepX = (width - padding * 2) / (data.length - 1);

    // Gradient area fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color + '30');
    gradient.addColorStop(1, color + '00');

    // Fill
    ctx.beginPath();
    ctx.moveTo(padding, height);
    data.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      ctx.lineTo(x, y);
    });
    ctx.lineTo(padding + (data.length - 1) * stepX, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    data.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // End dot
    const lastX = padding + (data.length - 1) * stepX;
    const lastY = height - padding - ((data[data.length - 1] - min) / range) * (height - padding * 2);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  // --- Render all agricultural KPIs ---
  function render(state = 'All', mandi = 'All', commodity = 'All') {
    const kpis = SalesData.getKPIs(state, mandi, commodity);
    const sparklines = SalesData.getSparklines(state, mandi, commodity);

    // 1. Avg Price
    const priceEl = document.getElementById('kpi-price-value');
    if (priceEl) {
      animateValue(priceEl, 0, kpis.avgPrice.value, 1200, '₹', '/Qtl');
    }

    // 2. Arrivals Volume
    const arrivalsEl = document.getElementById('kpi-arrivals-value');
    if (arrivalsEl) {
      animateValue(arrivalsEl, 0, kpis.totalArrivals.value, 1200, '', ' MT');
    }

    // 3. Volatility Index
    const volatilityEl = document.getElementById('kpi-volatility-value');
    if (volatilityEl) {
      animateValue(volatilityEl, 0, parseFloat(kpis.volatility.value), 1200, '', '%', 1);
    }

    // 4. Top Mandi (text element, animate the sub-value volume instead of the mandi name)
    const topMandiEl = document.getElementById('kpi-mandi-value');
    if (topMandiEl) {
      topMandiEl.textContent = kpis.topMandi.name;
    }
    const topMandiVolEl = document.getElementById('kpi-mandi-vol');
    if (topMandiVolEl) {
      animateValue(topMandiVolEl, 0, kpis.topMandi.value, 1200, 'Volume: ', ' MT');
    }

    // Update trend badges
    updateChange('kpi-price-change', kpis.avgPrice.change);
    updateChange('kpi-arrivals-change', kpis.totalArrivals.change);

    // Update Volatility status indicator text and class
    const volStatusEl = document.getElementById('kpi-volatility-status');
    if (volStatusEl) {
      volStatusEl.textContent = kpis.volatility.status;
      volStatusEl.className = 'kpi-change ' + 
        (kpis.volatility.status === 'Low' ? 'positive' : 
         kpis.volatility.status === 'Moderate' ? 'warning-badge-inline' : 'negative');
    }

    // Draw sparklines with delay to ensure canvas displays correctly
    setTimeout(() => {
      drawSparkline('sparkline-price', sparklines.price, '#10b981'); // Green
      drawSparkline('sparkline-arrivals', sparklines.arrivals, '#38bdf8'); // Blue
      drawSparkline('sparkline-volatility', sparklines.volatility, '#f59e0b'); // Gold
      drawSparkline('sparkline-mandi', sparklines.mandi, '#eab308'); // Yellow
    }, 100);
  }

  // Helper to update trend change percent labels
  function updateChange(id, change) {
    const el = document.getElementById(id);
    if (!el) return;
    const num = parseFloat(change);
    const isPositive = num >= 0;
    
    // Set appropriate class
    el.className = 'kpi-change ' + (isPositive ? 'positive' : 'negative');
    el.innerHTML = `${isPositive ? '↑' : '↓'} ${Math.abs(num).toFixed(1)}%`;
  }

  return { render, animateValue, drawSparkline };
})();
