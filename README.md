# 🌾 AgriMarket Analytics: AP & Telangana Mandis Dashboard

An interactive, professional-grade agricultural market analysis dashboard tracking commodity prices, trading volumes, price volatility, and supply-demand correlation metrics for mandis (market yards) in **Andhra Pradesh** and **Telangana**, India.

This project is built from scratch using vanilla frontend technologies (**HTML5**, **CSS3**, **ES6 JavaScript**, and **Chart.js**) with a premium dark glassmorphism aesthetic. It is designed to serve as a portfolio project showcasing data engineering, frontend layout skills, dynamic charting, and analytical modeling.

---

## 🚀 Key Features

*   **Cascading Dropdown Filters**: Select filters by State (Andhra Pradesh vs. Telangana), which dynamically updates the available Mandi selections (e.g. Guntur, Nizamabad, Kurnool, Warangal, etc.) and recalculates all metrics.
*   **Agricultural KPIs**:
    *   *Average Modal Price (₹/Quintal)* with percentage growth indicators.
    *   *Total Arrivals Volume (Metric Tons)* tracking trading throughput.
    *   *Price Volatility Index* (Standard Deviation / Modal Price) categorizing market risk as *Low*, *Moderate*, or *High Risk*.
    *   *Top Performing Mandi* by cumulative trade volume.
*   **Advanced Visualizations (Chart.js)**:
    *   📈 **Price Trend & Forecast**: Area-line chart graphing monthly prices for 2025 coupled with a 3-month predictive moving average forecast.
    *   📊 **Supply vs. Price Dynamics**: Dual-axis line-bar chart plotting arrival volumes (bars on Y1) against modal prices (line on Y2) to visualize classic supply-demand economics.
    *   🏛️ **Mandi Price Spread**: Horizontal bar chart comparing average crop prices across active agricultural markets.
    *   🍩 **Commodity Share Distribution**: Doughnut chart representing crop trade shares in Metric Tons.
*   **Searchable & Sorted Transaction Table**: Interactive log tables with multi-column sorting (Dates, Text, Numbers), search filters, and page-wise pagination (8 entries per view).
*   **CSV Exporter**: Functional download button allowing users to export the *currently filtered* dataset directly into a `.csv` spreadsheet file.
*   **Contextual Takeaways Engine**: Updates textual market observations dynamically depending on the selected filters (e.g., specific reports on Chilli inflation, Nizamabad Turmeric harvest updates, or onion supply shocks).
*   **Adaptive Glassmorphism Theme**: Toggleable dark and light theme options. Visualizations automatically re-render grid lines and labels to ensure maximum contrast and premium aesthetics.

---

## 🛠️ Tech Stack & Libraries

*   **Core Structure**: HTML5 (Semantic elements)
*   **Styling**: Vanilla CSS3 Custom Variables (HSL tailored dark/light palette, micro-animations, glassmorphic filters, custom scrollbars, and responsiveness)
*   **Logic**: Vanilla ES6 JavaScript (IIFE modules, custom count-up animations, canvas sparklines, custom pagination, and sorting)
*   **Charting Library**: [Chart.js (v4.4.4 via CDN)](https://www.chartjs.org/)

---

## 📂 Project Architecture

```markdown
├── index.html         # Main dashboard layout, filtering wrappers, and canvas targets
├── css/
│   └── styles.css     # Forestry design tokens, root properties, layouts, and animations
└── js/
    ├── data.js        # Synthetic mandi records generation, statistics, and insights APIs
    ├── charts.js      # Chart.js initialization, dual-axis scales, and theme redraw hooks
    ├── kpi.js         # Count-up animations, sparkline canvas drawings, and badge updates
    └── app.js         # Core event binding, table sorting, pagination, and CSV exports
```

---

## 📊 Embedded Data Model

The data layer in `js/data.js` models weekly transaction records spanning Jan 2025 to May 2026. The data generator accounts for:
1.  **Commodity Pricing Baselines**: Realistic price bounds (e.g., high-value Chillies trading at ₹14,000–22,000/Qtl vs. Paddy at ₹2,000–2,600/Qtl).
2.  **State-Mandi Specializations**: Limit crop availability to real-world regional hubs (e.g. Guntur for Chillies, Nizamabad for Turmeric, Kurnool for Onions, Warangal for Cotton).
3.  **Monsoon & Harvest Seasonality**:
    *   *Paddy*: High volumes and price dips in Nov-Dec (Kharif harvest) and Apr-May (Rabi harvest).
    *   *Chillies & Turmeric*: Peaks in volume during Feb-Apr.
    *   *Onions*: Modeled supply shortage shocks in Autumn (price spikes) and gluts in Winter.
4.  **Demand-Supply Elasticity**: High arrival volume slightly depresses modal pricing to simulate market dynamics.
5.  **Inflation trends**: 2026 baseline prices are adjusted up 6% over 2025 to model inflation.

---

## 💻 How to Run Locally

Since this dashboard uses pure vanilla code, it does **not** require any compile steps or npm installations.

### Method 1: Direct File Execution
1.  Clone the repository:
    ```bash
    git clone https://github.com/rajendar-123/agrimarket-analytics.git
    ```
2.  Double-click `index.html` to open it directly in any modern web browser.

### Method 2: Local HTTP Server (Recommended)
Running it through an HTTP server ensures CDNs and web features execute correctly:
1.  Navigate into the directory:
    ```bash
    cd agrimarket-analytics
    ```
2.  Start a static server:
    *   **Node.js**: Run `npx http-server -p 8080`
    *   **Python**: Run `python -m http.server 8080`
3.  Open your browser and head to **`http://localhost:8080`**.

---

## 💼 Portfolio Showcase Rationale
This project demonstrates several advanced engineering capabilities key for developer roles:
*   **State Coordination**: Shows proficiency in managing cascading UI filters without external framework overhead (React/Vue).
*   **Performance Optimization**: Chart.js instances are safely destroyed before recreation to prevent browser canvas leaks.
*   **Real-world Utility**: Functional CSV generation, paginated logs, and search indexing showcase experience building line-of-business tooling.
*   **Visual Polish**: Curated dark forest variables, glowing borders, custom scrollbars, and fluid layout cards demonstrate attention to UX/UI details.
