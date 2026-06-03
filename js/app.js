// ============================================================
// AgriMarket Analytics — Main Application Controller
// Coordinating filters, tables, charts, and exports
// ============================================================

const App = (() => {
  // Application State
  let currentState = 'All';
  let currentMandi = 'All';
  let currentCommodity = 'All';
  let tableSearch = '';
  
  let sortColumn = 'modalPrice';
  let sortAsc = false;
  
  let currentPage = 1;
  const pageSize = 8;
  let filteredRecords = [];

  function init() {
    // Populate Mandi filter initially
    populateMandiDropdown();
    
    // Set current date in header
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.textContent = dateStr;

    // Build visual components
    refreshAll();

    // Bind event listeners
    bindEvents();
  }

  // Populate Mandi select options dynamically based on State
  function populateMandiDropdown() {
    const mandiFilter = document.getElementById('mandi-filter');
    if (!mandiFilter) return;

    const mandis = SalesData.getMandis(currentState);
    
    // Clear and add "All Mandis"
    mandiFilter.innerHTML = '<option value="All">🏛️ All Mandis</option>';
    
    mandis.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      mandiFilter.appendChild(opt);
    });

    // Reset current selected mandi to All
    currentMandi = 'All';
    mandiFilter.value = 'All';
  }

  // Bind all interactive event listeners
  function bindEvents() {
    // 1. State Filter Change (Cascading)
    const stateSelect = document.getElementById('state-filter');
    if (stateSelect) {
      stateSelect.addEventListener('change', (e) => {
        currentState = e.target.value;
        populateMandiDropdown();
        currentPage = 1;
        refreshAll();
      });
    }

    // 2. Mandi Filter Change
    const mandiSelect = document.getElementById('mandi-filter');
    if (mandiSelect) {
      mandiSelect.addEventListener('change', (e) => {
        currentMandi = e.target.value;
        currentPage = 1;
        refreshAll();
      });
    }

    // 3. Commodity Filter Change
    const commoditySelect = document.getElementById('commodity-filter');
    if (commoditySelect) {
      commoditySelect.addEventListener('change', (e) => {
        currentCommodity = e.target.value;
        currentPage = 1;
        refreshAll();
      });
    }

    // 4. Theme Toggle Button
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const docEl = document.documentElement;
        const currentTheme = docEl.getAttribute('data-theme');
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        docEl.setAttribute('data-theme', nextTheme);
        themeBtn.textContent = nextTheme === 'light' ? '🌙' : '☀️';
        
        // Re-render charts so grid colors and labels update to match theme
        refreshCharts();
      });
    }

    // 5. Table Search Box
    const searchInput = document.getElementById('table-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        tableSearch = e.target.value.toLowerCase().trim();
        currentPage = 1;
        renderMandiTable();
      });
    }

    // 6. CSV Export Button
    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportToCSV);
    }

    // 7. Table Headers Sorting
    document.querySelectorAll('.sortable-header').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.sort;
        if (sortColumn === col) {
          sortAsc = !sortAsc;
        } else {
          sortColumn = col;
          sortAsc = false;
        }
        
        // Sort indicators class update
        document.querySelectorAll('.sortable-header').forEach(h => {
          h.classList.remove('sorted');
        });
        th.classList.add('sorted');
        
        // Re-render
        renderMandiTable();
      });
    });

    // 8. Pagination Button Listeners
    const prevBtn = document.getElementById('pagination-prev');
    const nextBtn = document.getElementById('pagination-next');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderMandiTable();
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredRecords.length / pageSize);
        if (currentPage < totalPages) {
          currentPage++;
          renderMandiTable();
        }
      });
    }
  }

  // Re-fetch calculations and draw all charts
  function refreshCharts() {
    const trendData = SalesData.getPriceTrend(currentState, currentMandi, currentCommodity);
    const supplyDemandData = SalesData.getArrivalsVsPrice(currentState, currentMandi, currentCommodity);
    const comparisonData = SalesData.getMandiComparison(currentState, currentCommodity);
    const shareData = SalesData.getCommodityShare(currentState, currentMandi);

    Charts.createPriceTrendChart(document.getElementById('priceTrendChart'), trendData);
    Charts.createArrivalsPriceChart(document.getElementById('arrivalsPriceChart'), supplyDemandData);
    Charts.createMandiCompareChart(document.getElementById('mandiCompareChart'), comparisonData);
    Charts.createCropShareChart(document.getElementById('cropShareChart'), shareData);
  }

  // Fetch insights list and render
  function renderInsights() {
    const container = document.getElementById('insights-container');
    if (!container) return;

    const list = SalesData.getInsights(currentState, currentMandi, currentCommodity);

    if (list.length === 0) {
      container.innerHTML = '<p class="no-insights">No insights available for current filters.</p>';
      return;
    }

    container.innerHTML = list.map(item => {
      // Parse markdown bold **text** to HTML strong tags
      const formatted = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return `<div class="insight-item"><p>${formatted}</p></div>`;
    }).join('');
  }

  // Filter, sort, paginate, and render the Mandi transactions table
  function renderMandiTable() {
    const tbody = document.getElementById('mandi-tbody');
    if (!tbody) return;

    // Get all records from data layer
    const records = SalesData.getRawRecords();

    // 1. Apply drop-down filters
    filteredRecords = records.filter(r => {
      if (currentState !== 'All' && r.state !== currentState) return false;
      if (currentMandi !== 'All' && r.mandi !== currentMandi) return false;
      if (currentCommodity !== 'All' && r.commodity !== currentCommodity) return false;
      
      // 2. Apply search box text filter
      if (tableSearch !== '') {
        const matchesSearch = 
          r.mandi.toLowerCase().includes(tableSearch) ||
          r.commodity.toLowerCase().includes(tableSearch) ||
          r.state.toLowerCase().includes(tableSearch) ||
          r.date.includes(tableSearch);
        if (!matchesSearch) return false;
      }
      return true;
    });

    // 3. Apply sorting
    filteredRecords.sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      // Handle date comparison
      if (sortColumn === 'date') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      
      // Handle text comparison
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      // Numerical comparison
      return sortAsc ? valA - valB : valB - valA;
    });

    // 4. Pagination math
    const totalRecords = filteredRecords.length;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    
    // Clamp current page
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalRecords);
    const paginated = filteredRecords.slice(startIdx, endIdx);

    // 5. Render rows
    if (paginated.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--text-muted);">No transaction logs found matching current filters.</td></tr>`;
    } else {
      tbody.innerHTML = paginated.map((r, i) => {
        const num = startIdx + i + 1;
        const cropClass = r.commodity.toLowerCase();
        
        // Volatility status calculation for status column
        // We evaluate trend based on min-max price gap
        const priceGapPct = (r.maxPrice - r.minPrice) / r.modalPrice * 100;
        let statusClass = 'stable';
        let statusLabel = 'Stable';
        
        if (priceGapPct > 20) {
          statusClass = 'declining'; // Highly fluctuating prices represents uncertainty
          statusLabel = 'Volatile';
        } else if (priceGapPct < 10) {
          statusClass = 'trending';
          statusLabel = 'Highly Stable';
        }

        return `
          <tr>
            <td><span class="product-rank">${num}</span></td>
            <td>${r.date}</td>
            <td><span class="product-name">${r.mandi}</span></td>
            <td><span class="state-label">${r.state === 'Andhra Pradesh' ? 'AP' : 'TS'}</span></td>
            <td><span class="category-badge ${cropClass}">${r.commodity}</span></td>
            <td><strong>${r.arrivals.toLocaleString()} MT</strong></td>
            <td><strong>₹${r.modalPrice.toLocaleString()}</strong></td>
            <td><span class="status-indicator ${statusClass}">${statusLabel}</span></td>
          </tr>
        `;
      }).join('');
    }

    // 6. Update pagination text and buttons
    const infoEl = document.getElementById('pagination-info');
    if (infoEl) {
      if (totalRecords === 0) {
        infoEl.textContent = 'Showing 0-0 of 0 logs';
      } else {
        infoEl.textContent = `Showing ${startIdx + 1}-${endIdx} of ${totalRecords} transaction logs`;
      }
    }

    const prevBtn = document.getElementById('pagination-prev');
    const nextBtn = document.getElementById('pagination-next');
    if (prevBtn) prevBtn.disabled = (currentPage === 1);
    if (nextBtn) nextBtn.disabled = (currentPage === totalPages || totalRecords === 0);
  }

  // Convert currently filtered logs to CSV and download
  function exportToCSV() {
    if (filteredRecords.length === 0) {
      alert('No data available to export.');
      return;
    }

    // Define columns
    const headers = ['ID', 'Date', 'Mandi', 'State', 'Commodity', 'Arrivals (MT)', 'Min Price (INR/Qtl)', 'Max Price (INR/Qtl)', 'Modal Price (INR/Qtl)'];
    
    // Map records to rows
    const rows = filteredRecords.map(r => [
      r.id,
      r.date,
      `"${r.mandi}"`,
      `"${r.state}"`,
      `"${r.commodity}"`,
      r.arrivals,
      r.minPrice,
      r.maxPrice,
      r.modalPrice
    ]);

    // Build CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Mandi_Market_Report_${currentState}_${currentCommodity}_${timestamp}.csv`.replace(/ /g, '_');
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Core refresh routine
  function refreshAll() {
    KPI.render(currentState, currentMandi, currentCommodity);
    refreshCharts();
    renderInsights();
    renderMandiTable();
  }

  return { init };
})();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', App.init);
