# IMTA Aquaculture Water Quality Dashboard

A full-stack web application for IMTA (Integrated Multi-Trophic Aquaculture) water quality monitoring and impact tracking. Monitor water quality in real-time, track farm activities, analyze trends, and measure IMTA's positive impact on your aquaculture operation.

## 🌟 Key Features

### 🔐 Authentication & Multi-Tenancy
- **Email magic link authentication** powered by InstantDB
- **Multi-farm support** - each farm has isolated data
- **Onboarding flow** for new farm setup

### 📊 Real-Time Water Quality Monitoring
- **Live sensor data** with InstantDB real-time sync
- **WQI (Water Quality Index)** calculation based on 8 parameters
- **Visual dashboard** with gauges, charts, and breakdowns
- **AI-powered recommendations** for feeding, species, and maintenance

### 📝 Activity Tracking
- **Feed logging** - track feed amounts, types, and species
- **Species management** - log additions and removals
- **Maintenance records** - keep notes on farm operations
- **Real-time activity history** with filtering

### 📈 Trend Analysis & Baseline
- **Automatic baseline** calculated from first 30 days
- **Long-term WQI trends** with customizable time ranges
- **Improvement tracking** compared to baseline
- **Visual trend charts** showing progress over time

### 🏆 Milestone System
- **Automatic achievement detection** for WQI improvements
- **Progress tracking** - 30, 60, 90 days milestones
- **Impact summary** showing IMTA benefits
- **Eco-friendliness score** based on water quality

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Database**: InstantDB (real-time, cloud-hosted)
- **Authentication**: InstantDB Auth (magic links)
- **Charts**: Recharts
- **Date Handling**: date-fns

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- InstantDB account (free at [instantdb.com](https://instantdb.com))

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Configure InstantDB:**
   - The app is already configured with App ID: `0ff4c356-edb9-4b27-b6e6-7e1e32c7ccd8`
   - No additional configuration needed!

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. **Sign in** - Enter your email to receive a magic link
2. **Onboarding** - Create your farm profile:
   - Farm name
   - Location (optional)
   - IMTA implementation date
3. **Generate data** - Click "Generate Initial Data" to create your first sensor reading
4. **Start tracking** - Use "Run New Scan" to simulate new readings

### Optional: Seed Historical Data

To populate 30 days of baseline data for testing:

```bash
# Get admin token from InstantDB dashboard
export INSTANTDB_ADMIN_TOKEN="your-admin-token"

# Run seeding script (replace with your farmId)
npx ts-node scripts/seed-initial-data.ts <your-farm-id>
```

## 📁 Project Structure

```
/
├── app/
│   ├── api/                    # API routes
│   │   ├── sensor-data/        # Sensor data ingestion
│   │   ├── wqi/                # WQI calculation (legacy)
│   │   └── recommendations/    # Recommendations (legacy)
│   ├── auth/                   # Authentication pages
│   ├── onboarding/             # Farm setup
│   ├── page.tsx                # Main dashboard
│   └── layout.tsx              # Root layout with providers
│
├── components/                 # React components
│   ├── WQIGauge.tsx           # WQI visualization
│   ├── WaterQualityChart.tsx  # 24h trend chart
│   ├── WQIBreakdown.tsx       # Parameter breakdown
│   ├── SensorDataTable.tsx    # Current readings
│   ├── RecommendationsList.tsx # Action items
│   ├── ActivityLogger.tsx      # Activity input form
│   ├── ActivityHistory.tsx     # Activity timeline
│   ├── TrendAnalysis.tsx       # Long-term trends
│   ├── MilestoneDisplay.tsx    # Achievements
│   ├── ImpactSummary.tsx       # IMTA impact metrics
│   ├── AuthButton.tsx          # Login/logout
│   └── ProtectedRoute.tsx      # Route protection
│
├── lib/                        # Core business logic
│   ├── instant.ts              # InstantDB client
│   ├── auth-context.tsx        # Auth provider
│   ├── farm-context.tsx        # Farm data provider
│   ├── wqi-calculator.ts       # WQI algorithm
│   ├── wqi-config.ts           # WQI weights (configurable)
│   ├── recommendations.ts      # Recommendation engine
│   ├── recommendation-rules.ts # Rules (configurable)
│   ├── sensor-data-instant.ts  # Sensor data helpers
│   ├── baseline-calculator.ts  # Baseline & trends
│   └── milestone-detector.ts   # Achievement logic
│
├── types/                      # TypeScript definitions
│   └── index.ts               # All interfaces
│
└── scripts/                    # Utility scripts
    └── seed-initial-data.ts   # Data seeding
```

## 🎯 Features Guide

### Dashboard Tabs

1. **Sensor Data**
   - Current WQI gauge with color-coded status
   - 24-hour trend chart
   - Live sensor readings table
   - Parameter breakdown with risk levels

2. **Recommendations**
   - AI-generated action items
   - Prioritized by urgency
   - Context-aware suggestions for IMTA

3. **Activity Log**
   - Log feeding events with amounts and types
   - Track species additions/removals
   - Record maintenance activities
   - View activity history timeline

4. **Trends**
   - Long-term WQI trend analysis
   - Baseline comparison
   - Improvement percentage
   - Customizable time ranges (7/30/90 days, all time)

5. **Milestones**
   - IMTA impact summary with key metrics
   - Achievement badges for WQI improvements
   - Progress tracking (30/60/90 days)
   - Eco-friendliness score

### Water Quality Parameters

| Parameter | Units | Optimal Range | WQI Weight |
|-----------|-------|---------------|------------|
| Temperature | °C | 20-30 | 10% |
| pH | - | 7.0-8.5 | 15% |
| Dissolved Oxygen (DO) | mg/L | 5-8 | 20% |
| Turbidity | NTU | <15 | 12% |
| Salinity | ppt | Species-dependent | 8% |
| Ammonia (NH3-N) | mg/L | <0.1 | 18% |
| Total Nitrogen (TN) | mg/L | <1 | 9% |
| Total Phosphate (TP) | mg/L | <0.1 | 8% |

### WQI Categories

- **Excellent** (90-100): All parameters optimal
- **Good** (70-90): Minor adjustments recommended
- **Moderate** (50-70): Action required for some parameters
- **Poor** (<50): Immediate intervention needed

## ⚙️ Configuration

### Customize WQI Weights

Edit `lib/wqi-config.ts`:

```typescript
export const WQI_WEIGHTS = {
  dissolvedOxygen: 0.20,  // Adjust weights
  pH: 0.15,
  ammonia: 0.18,
  // ...
};
```

### Customize Recommendations

Edit `lib/recommendation-rules.ts`:

```typescript
{
  condition: (reading, wqi) => reading.do < 5,
  category: 'Feeding',
  action: 'Your custom recommendation',
  reason: 'Your explanation',
  priority: 'High',
}
```

### Add New Milestones

Edit `lib/milestone-detector.ts` to add custom achievement types.

## 🔧 API Reference

### POST `/api/sensor-data`

Add a new sensor reading (requires `farmId`).

**Request:**
```json
{
  "farmId": "farm-id-here",
  "temperature": 27.5,
  "ph": 7.2,
  "do": 6.8,
  "turbidity": 12,
  "salinity": 25,
  "ammonia": 0.05,
  "tn": 0.7,
  "tp": 0.04
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sensor data recorded successfully",
  "reading": { /* ... */ }
}
```

## 🌱 IMTA Benefits Tracked

The dashboard tracks these IMTA improvements:

1. **Water Quality Improvement** - Measured by WQI increase from baseline
2. **Days Tracked** - Continuous monitoring duration
3. **Eco-Friendliness Score** - Based on current WQI and improvement
4. **Estimated Yield Increase** - Calculated from water quality improvements

### Impact Calculation

- **Baseline**: Average WQI from first 30 days
- **Current**: Rolling 7-day average WQI
- **Improvement**: Percentage increase from baseline
- **Yield Estimate**: 1% WQI improvement ≈ 0.5% yield increase

## 🔐 Data Security

- **Multi-tenancy**: Each farm's data is isolated by `farmId`
- **Authentication**: Required for all dashboard access
- **Real-time sync**: InstantDB handles data consistency
- **Permissions**: Users can only access their own farm data

## 🐛 Troubleshooting

### Can't sign in?
- Check your email for the magic link
- Link expires after 10 minutes
- Try resending the code

### No data showing?
- Click "Generate Initial Data" on first visit
- Ensure you're logged in and have a farm set up
- Check browser console for errors

### Milestones not appearing?
- Ensure you have 30+ days of data for baseline
- Milestones auto-detect on page load
- Try refreshing the Milestones tab

## 📝 Development Notes

- **Real-time updates**: All data syncs automatically via InstantDB
- **No backend server needed**: InstantDB handles database and auth
- **Mobile-first**: Optimized for field use on tablets/phones
- **Type-safe**: Full TypeScript coverage
- **Configurable**: Easy to adjust weights, rules, and thresholds

## 🚀 Deployment

This app can be deployed to Vercel, Netlify, or any Next.js hosting platform:

```bash
npm run build
npm start
```

No environment variables needed - InstantDB App ID is already configured!

## 📚 Learn More

- [InstantDB Documentation](https://instantdb.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [IMTA Overview](https://www.fao.org/aquaculture/imta)

## 🤝 Contributing

This is a prototype project. Improvements welcome!

## 📄 License

MIT License - Free to use and modify for your aquaculture operation.

---

**Built with ❤️ for sustainable aquaculture farmers**
