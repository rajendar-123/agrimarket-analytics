// ============================================================
// AgriMarket Analytics — Chart.js Visualizations
// ============================================================

const Charts = (() => {
  const gridColor = 'rgba(255, 255, 255, 0.05)';
  const gridColorLight = 'rgba(0, 0, 0, 0.04)';
  const tickColorDark = '#94a3b8';
  const tickColorLight = '#475569';
  const fontFamily = "'Inter', sans-serif";

  // Helpers to get current colors based on theme
  function getTickColor() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? tickColorLight : tickColorDark;
  }
  
  function getGridColor() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? gridColorLight : gridColor;
  }

  Chart.defaults.font.family = fontFamily;

  let priceTrendChart = null;
  let arrivalsPriceChart = null;
  let mandiCompareChart = null;
  let cropShareChart = null;

  // Destroy a chart if it exists to prevent canvas reuse errors
  function safeDestroy(chartInstance) {
    if (chartInstance && typeof chartInstance.destroy === 'function') {
      chartInstance.destroy();
    }
  }

  // --- 1. Price Trend & Forecast (Line + Area) ---
  function createPriceTrendChart(canvas, data) {
    safeDestroy(priceTrendChart);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    // Gradients
    const gradientHist = ctx.createLinearGradient(0, 0, 0, 250);
    gradientHist.addColorStop(0, isLight ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.25)');
    gradientHist.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    priceTrendChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Historical Modal Price',
            data: data.historical,
            borderColor: '#10b981', // Emerald
            backgroundColor: gradientHist,
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#10b981',
            pointBorderColor: isLight ? '#fff' : '#0f0f23',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            spanGaps: true
          },
          {
            label: 'Forecasted Price',
            data: data.forecast,
            borderColor: '#f59e0b', // Amber/Gold
            borderDash: [6, 6],
            borderWidth: 2.5,
            fill: false,
            tension: 0.35,
            pointBackgroundColor: '#f59e0b',
            pointBorderColor: isLight ? '#fff' : '#0f0f23',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            spanGaps: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: getTickColor(),
              boxWidth: 12,
              font: { size: 11, weight: '500' }
            }
          },
          tooltip: {
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 15, 35, 0.95)',
            titleColor: isLight ? '#1e293b' : '#e2e8f0',
            bodyColor: isLight ? '#475569' : '#94a3b8',
            borderColor: '#10b98140',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = context.parsed.y;
                return val ? ` ${label}: ₹${val.toLocaleString()}/Qtl` : '';
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: getGridColor(), drawBorder: false },
            ticks: { color: getTickColor(), font: { size: 10, weight: '500' } }
          },
          y: {
            grid: { color: getGridColor(), drawBorder: false },
            ticks: {
              color: getTickColor(),
              font: { size: 10 },
              callback: (v) => '₹' + v.toLocaleString()
            }
          }
        }
      }
    });

    return priceTrendChart;
  }

  // --- 2. Arrivals vs Price Correlation (Dual Axis: Bar + Line) ---
  function createArrivalsPriceChart(canvas, data) {
    safeDestroy(arrivalsPriceChart);
    if (!canvas) return null;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    arrivalsPriceChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            type: 'bar',
            label: 'Arrival Volume (MT)',
            data: data.arrivals,
            backgroundColor: 'rgba(56, 189, 248, 0.25)', // Sky blue transparent
            borderColor: '#38bdf8',
            borderWidth: 1.5,
            borderRadius: 4,
            yAxisID: 'yVolume'
          },
          {
            type: 'line',
            label: 'Modal Price (₹/Qtl)',
            data: data.prices,
            borderColor: '#eab308', // Yellow
            borderWidth: 3,
            fill: false,
            tension: 0.3,
            pointBackgroundColor: '#eab308',
            pointRadius: 3,
            yAxisID: 'yPrice'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: getTickColor(),
              boxWidth: 12,
              font: { size: 11, weight: '500' }
            }
          },
          tooltip: {
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 15, 35, 0.95)',
            titleColor: isLight ? '#1e293b' : '#e2e8f0',
            bodyColor: isLight ? '#475569' : '#94a3b8',
            borderColor: '#38bdf840',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = context.parsed.y;
                if (context.datasetIndex === 0) {
                  return ` ${label}: ${val.toLocaleString()} MT`;
                }
                return ` ${label}: ₹${val.toLocaleString()}/Qtl`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: getGridColor(), drawBorder: false },
            ticks: { color: getTickColor(), font: { size: 10, weight: '500' } }
          },
          yVolume: {
            position: 'left',
            grid: { color: getGridColor(), drawBorder: false },
            ticks: {
              color: getTickColor(),
              font: { size: 10 },
              callback: (v) => v.toLocaleString() + ' MT'
            },
            title: {
              display: true,
              text: 'Arrival Volume (Metric Tons)',
              color: getTickColor(),
              font: { size: 10, weight: '600' }
            }
          },
          yPrice: {
            position: 'right',
            grid: { drawOnChartArea: false }, // Only show grid lines for left axis
            ticks: {
              color: getTickColor(),
              font: { size: 10 },
              callback: (v) => '₹' + v.toLocaleString()
            },
            title: {
              display: true,
              text: 'Modal Price (₹/Quintal)',
              color: getTickColor(),
              font: { size: 10, weight: '600' }
            }
          }
        }
      }
    });

    return arrivalsPriceChart;
  }

  // --- 3. Mandi Price Comparison (Horizontal Bar Chart) ---
  function createMandiCompareChart(canvas, data) {
    safeDestroy(mandiCompareChart);
    if (!canvas) return null;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    mandiCompareChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Average Modal Price (₹/Qtl)',
          data: data.prices,
          backgroundColor: 'rgba(16, 185, 129, 0.75)',
          borderColor: '#10b981',
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 15, 35, 0.95)',
            titleColor: isLight ? '#1e293b' : '#e2e8f0',
            bodyColor: isLight ? '#475569' : '#94a3b8',
            borderColor: '#10b98140',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => ` Modal Price: ₹${context.parsed.x.toLocaleString()}/Qtl`
            }
          }
        },
        scales: {
          x: {
            grid: { color: getGridColor(), drawBorder: false },
            ticks: {
              color: getTickColor(),
              font: { size: 10 },
              callback: (v) => '₹' + v.toLocaleString()
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              color: getTickColor(),
              font: { size: 10, weight: '600' }
            }
          }
        }
      }
    });

    return mandiCompareChart;
  }

  // --- 4. Crop Share / Distribution (Doughnut Chart) ---
  function createCropShareChart(canvas, data) {
    safeDestroy(cropShareChart);
    if (!canvas) return null;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    cropShareChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: data.colors,
          borderColor: isLight ? '#fff' : '#0f0f23',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: getTickColor(),
              padding: 12,
              usePointStyle: true,
              pointStyleWidth: 8,
              font: { size: 11, weight: '500' }
            }
          },
          tooltip: {
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 15, 35, 0.95)',
            titleColor: isLight ? '#1e293b' : '#e2e8f0',
            bodyColor: isLight ? '#475569' : '#94a3b8',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const val = context.parsed;
                const pct = ((val / total) * 100).toFixed(1);
                return ` ${context.label}: ${val.toLocaleString()} MT (${pct}%)`;
              }
            }
          }
        }
      }
    });

    return cropShareChart;
  }

  return {
    createPriceTrendChart,
    createArrivalsPriceChart,
    createMandiCompareChart,
    createCropShareChart
  };
})();
