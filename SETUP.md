# Quick Start Guide

## 🚀 Getting Started in 3 Minutes

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

### 3. Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000)

### 4. Sign In

1. Click "Sign In" or you'll be redirected to the auth page
2. Enter your email address
3. Check your email for the magic link code
4. Enter the 6-digit code to sign in

### 5. Set Up Your Farm

1. Enter your farm name (e.g., "Green Valley Aquafarm")
2. Optionally add location
3. Select when you started using IMTA
4. Click "Create Farm Profile"

### 6. Generate Initial Data

1. You'll see "No Data Available"
2. Click "Generate Initial Data"
3. Your first sensor reading will be created!

### 7. Explore the Dashboard

**Sensor Data Tab:**
- View current WQI score
- See 24-hour trends
- Check individual parameters

**Recommendations Tab:**
- Get AI-powered suggestions
- See prioritized action items

**Activity Log Tab:**
- Log feeding events
- Track species additions/removals
- Record maintenance activities

**Trends Tab:**
- View long-term WQI improvements
- Compare against baseline
- See improvement percentage

**Milestones Tab:**
- Track IMTA impact
- Unlock achievements
- View eco-friendliness score

## 🎯 Tips for Testing

### Generate More Data

Click "Run New Scan" at the bottom of the dashboard to simulate new sensor readings.

### Test Activity Logging

1. Go to "Activity Log" tab
2. Select activity type (Feeding, Species Added, etc.)
3. Fill in details
4. Click "Log Activity"

### See Milestones

Milestones are automatically detected! To test:
1. Generate 30+ sensor readings over time
2. Go to "Milestones" tab
3. See achievements unlock

### View Trends

1. Generate multiple readings
2. Go to "Trends" tab
3. Select different time ranges (7/30/90 days)

## 🔧 Troubleshooting

**Can't sign in?**
- Check spam folder for magic link email
- Code expires in 10 minutes - request a new one

**No data showing?**
- Make sure you clicked "Generate Initial Data"
- Check browser console for errors
- Refresh the page

**Build errors?**
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize WQI weights in `lib/wqi-config.ts`
- Modify recommendation rules in `lib/recommendation-rules.ts`
- Add new milestone types in `lib/milestone-detector.ts`

## 🌟 Key Features to Try

✅ Real-time data sync (open in 2 tabs!)  
✅ Activity logging with history  
✅ Baseline comparison and trends  
✅ Automatic milestone detection  
✅ Multi-farm support (create multiple accounts)  

Enjoy monitoring your aquaculture farm! 🐟🌊

