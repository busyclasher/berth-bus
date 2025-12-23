<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🚌 SBS Transit Berth Management System

**NFC-Powered Bus Tracking for Multi-Storey Depots**

Solving critical operational challenges:
- ⚡ **15-20 minute vehicle searches** → Instant location lookup
- 📡 **GPS signal blockage** → NFC-based tracking works everywhere
- 🔧 **Manual status updates** → Automated breakdown detection

---

## 🎯 Key Features

### For Operations Managers
- Real-time berth occupancy dashboard (Grid + Map views)
- **NEW**: Automated breakdown alerts (detects buses inactive >2hrs)
- Performance metrics and turnaround analytics
- Configurable alert thresholds

### For Bus Captains
- One-tap NFC check-in/check-out
- **NEW**: Smart auto-assign parking (finds optimal berth instantly)
- Departure countdown with 5-minute warnings
- Haptic feedback and success animations

### For Technicians
- **NEW**: Asset locator search (type "Bus 8888" → see exact location)
- **NEW**: NFC tap simulation for status updates
- Walk-straight-to-fault (zero search time)
- Update bus status: Parking → Maintenance → Ready

📄 **Full Feature Documentation**: See [FEATURES.md](FEATURES.md)

---

## 🚀 Quick Start

**Prerequisites:** Node.js 18+

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment** (optional - for voice features):
   ```bash
   # Create .env.local
   echo "GEMINI_API_KEY=your_api_key_here" > .env.local
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:5173
   ```

---

## 🎮 Demo Guide

### Test Scenario 1: Bus Captain Flow
1. Switch to "Captain" tab
2. Current status: EN_ROUTE
3. Click "Auto-Assign Parking" → System assigns best berth
4. Click "Tap-In at Berth" → Select berth → Confirm
5. Watch success animation
6. View countdown timer
7. Click "Tap-Out to Depart"

### Test Scenario 2: Technician Flow
1. Switch to "Technician" tab
2. Search for "8888" or "SMB315C"
3. View exact location: Level, Zone, Berth
4. Click bus → See detailed location
5. Update status to "Maintenance"
6. Watch NFC tap animation

### Test Scenario 3: Manager Breakdown Alert
1. Switch to "Manager" tab
2. See critical alert for Bus SG8888K (Service 133)
3. Bus has been inactive for 3+ hours
4. Click "Configure alert threshold" to adjust sensitivity
5. View live depot map showing all buses

---

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Voice AI**: Google Gemini (optional)

---

## 📁 Project Structure

```
berth-bus/
├── App.tsx                    # Main app with role switcher
├── components/
│   ├── BusCaptainInterface.tsx    # Captain view (NFC tap + auto-assign)
│   ├── OperationsDashboard.tsx    # Manager view (berth map + alerts)
│   ├── TechnicianInterface.tsx    # NEW: Technician search + status
│   └── VoiceAssistant.tsx         # Voice command support
├── types.ts                   # TypeScript interfaces
├── constants.ts               # Initial data + demo bus
└── services/
    └── geminiLiveService.ts   # AI voice service
```

---

## 🎯 Hackathon Value

### Problem Scope
- **50+ buses** per depot
- **Multi-storey** concrete structures
- **No GPS** signal penetration
- **15-20 min** wasted per vehicle search

### Solution Impact
- ✅ **100% reduction** in search time
- ✅ **Instant location** lookup for technicians
- ✅ **Proactive alerts** prevent breakdowns
- ✅ **Smart automation** reduces decision fatigue

### Cost-Benefit
- **Low Cost**: Only NFC tags needed
- **High ROI**: Immediate time savings
- **Scalable**: Works for 1-100 depots
- **Easy Training**: Intuitive interface

---

## 🔧 Development

```bash
# Install dependencies
npm install

# Run dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📱 Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Safari
- ✅ Firefox
- ✅ Mobile browsers
- ⚡ PWA-ready

---

## 🎨 Design Philosophy

- **No major UI changes**: Enhanced existing design
- **Consistent styling**: Matches SBS Transit brand
- **Mobile-first**: Works on phones and tablets
- **Accessibility**: Clear icons and feedback

---

## 🚀 Future Roadmap

1. Real NFC hardware integration (Arduino/Raspberry Pi)
2. Push notifications for managers
3. Historical analytics & reporting
4. Integration with existing SBS systems
5. Multi-depot support
6. Predictive maintenance AI
7. Route optimization suggestions

---

## 📞 Support

Built for **SBS Transit Hackathon 2025**

**Key Innovation**: Bypassing GPS limitations in concrete structures with NFC + intelligent automation

View your app in AI Studio: https://ai.studio/apps/drive/1DmunD2Oy507-dpqft_fR7j5bWNCcQpHU

---

## 📜 License

Developed for SBS Transit operational improvement initiative.
