# Aquaculture Water Quality Monitoring Dashboard

A prototype web dashboard for IMTA (Integrated Multi-Trophic Aquaculture) water quality monitoring system. This MVP focuses on core API-driven features: IoT sensor data ingestion, AI-powered WQI (Water Quality Index) analysis, and farmer recommendations.

## Features

- **Real-time Sensor Data Ingestion**: Mock IoT sensor data collection (simulates sensors from i-ocean, Milesight)
- **WQI Calculation**: NSFWQI-based water quality index with configurable parameter weights
- **AI-Powered Recommendations**: Rule-based recommendations for feeding and species additions
- **Interactive Dashboard**: Mobile-first responsive design with charts and visualizations
- **Configurable Parameters**: Easy-to-modify weights and recommendation rules

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS
- **Charts**: Recharts
- **Data Storage**: JSON files (can migrate to SQLite later)
- **WQI Calculation**: Rule-based NSFWQI formula
- **Recommendations**: Rule-based logic with configurable thresholds

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Initial Data Setup

On first run, the system will automatically generate 24 hours of historical sensor data. You can also click "Run New Scan" to simulate new sensor readings.

## Project Structure

```
/
├── app/
│   ├── api/              # API routes
│   │   ├── sensor-data/  # POST endpoint for sensor ingestion
│   │   ├── wqi/          # GET endpoint for WQI calculation
│   │   └── recommendations/ # GET endpoint for recommendations
│   ├── page.tsx          # Main dashboard
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── WQIGauge.tsx
│   ├── WaterQualityChart.tsx
│   ├── WQIBreakdown.tsx
│   ├── RecommendationsList.tsx
│   └── SensorDataTable.tsx
├── lib/                  # Core logic
│   ├── wqi-calculator.ts      # WQI calculation
│   ├── wqi-config.ts          # Configurable WQI weights
│   ├── recommendations.ts     # Recommendation engine
│   ├── recommendation-rules.ts # Configurable rules
│   └── sensor-data.ts         # Mock data management
├── types/                # TypeScript interfaces
└── data/                 # JSON data storage
```

## Configuration

### Modifying WQI Weights

Edit `lib/wqi-config.ts` to adjust parameter weights:

```typescript
export const WQI_WEIGHTS = {
  dissolvedOxygen: 0.2,  // Change this value
  pH: 0.15,
  // ... etc
};
```

### Modifying Recommendation Rules

Edit `lib/recommendation-rules.ts` to adjust thresholds and actions:

```typescript
{
  condition: (reading, wqi) => reading.do < 6,  // Change threshold
  category: 'Feeding',
  action: 'Your custom action here',
  // ... etc
}
```

## API Endpoints

### POST `/api/sensor-data`
Accepts sensor reading payload or generates mock data.

**Request Body (optional):**
```json
{
  "timestamp": "2025-12-28T02:18:00Z",
  "temperature": 27.5,
  "ph": 7.2,
  "do": 6.8,
  "turbidity": 15,
  "salinity": 20,
  "ammonia": 0.08,
  "tn": 0.8,
  "tp": 0.06
}
```

### GET `/api/wqi`
Returns current WQI score, category, breakdown, and 24h trend.

**Response:**
```json
{
  "overall": 75.5,
  "category": "Good",
  "breakdown": [...],
  "trendAnalysis": "...",
  "trend": {
    "timestamps": [...],
    "scores": [...]
  }
}
```

### GET `/api/recommendations?wqi=75`
Returns recommendations based on sensor data and WQI.

**Response:**
```json
{
  "wqi": 75,
  "recommendations": [
    {
      "category": "Feeding",
      "action": "...",
      "reason": "...",
      "priority": "High"
    }
  ]
}
```

## Testing Scenarios

1. **Normal Conditions**: All parameters in range → Good WQI → Standard recommendations
2. **Low DO Crisis**: DO < 5 mg/L → Poor WQI → "Delay feeding, add aeration"
3. **High Turbidity**: Turbidity > 15 NTU → Moderate WQI → "Add mussels"
4. **High Nutrients**: TN/TP elevated → Moderate WQI → "Add seaweed"

## Sensor Parameters

| Parameter | Units | Typical Range | Impact on WQI |
|-----------|-------|---------------|---------------|
| Temperature | °C | 20-30 | Affects DO solubility |
| pH | - | 6.5-8.5 | Acidification risk |
| Dissolved Oxygen (DO) | mg/L | 5-8 | Fish stress threshold |
| Turbidity | NTU | 0-20 | Waste accumulation |
| Salinity | ppt | 0-35 | Species tolerance |
| Ammonia (NH3-N) | mg/L | <0.1 | Toxicity |
| Total Nitrogen (TN) | mg/L | <1 | Eutrophication |
| Phosphate (TP) | mg/L | <0.1 | Algal blooms |

## WQI Categories

- **Excellent** (90-100): All parameters optimal
- **Good** (70-90): Minor adjustments may be needed
- **Moderate** (50-70): Some parameters require attention
- **Poor** (<50): Immediate intervention required

## Next Steps (Post-Prototype)

- Real sensor API integration (i-ocean, Milesight)
- SQLite database migration
- User authentication
- Historical data analytics
- Alert notifications
- Multi-farm support
- Advanced ML-based recommendations

## Development Notes

- This is a prototype using mock data
- File-based JSON storage for rapid development
- Rule-based logic (not ML) for recommendations
- Mobile-first design for field use
- Configurable weights and rules for easy iteration

## License

This is a prototype project for demonstration purposes.

