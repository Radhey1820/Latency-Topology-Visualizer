# Latency Topology Visualizer

This project visualizes global latency between major cryptocurrency exchange servers and cloud regions in real-time, along with historical latency trends.

## 🌍 Features

- **3D Interactive Globe** rendered using **Three.js**
- **Hardcoded exchange server locations** for now (e.g., Binance, Coinbase, etc.)
- **Real-time latency visualization** using **Cloudflare Radar API**
- **Animated latency lines** color-coded by latency range
- **Historical latency trends chart** implemented using **Recharts**
- **Time range selector**: view data for 1 hour, 24 hours, 7 days, or 30 days
- **Statistics** for latency (min, max, average) displayed alongside the chart
- **Cloud provider filter and region selector** (in progress)
- **Fully responsive UI** with modern layout and controls

## 🔧 Tech Stack

- **React** (Next.js)
- **Three.js** via `@react-three/fiber` and `@react-three/drei`
- **Recharts** for rendering time-series latency charts
- **Cloudflare Radar API** for real-time and historical latency data
- **Tailwind CSS** for styling

## 📡 Data Sources

- **Server locations** are currently hardcoded in the application.
- **Latency data** (real-time & historical) is fetched from:
  - [`/client/v4/radar/netflows/timeseries`](https://developers.cloudflare.com/api/operations/radar-netflows-get-timeseries)

## 📦 Installation

```bash
git clone https://github.com/Radhey1820/Latency-Topology-Visualizer.git
cd Latency-Topology-Visualizer
npm install
npm run dev
```
