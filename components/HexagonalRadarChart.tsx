'use client';

import { useMemo } from 'react';
import { ParameterScore } from '@/lib/species-suitability-calculator';

interface HexagonalRadarChartProps {
  parameterScores: ParameterScore[];
  size?: number;
  speciesName?: string;
}

// Chart configuration
const NUM_AXES = 7;
const ANGLE_OFFSET = -Math.PI / 2; // Start from top

export default function HexagonalRadarChart({
  parameterScores,
  size = 280,
  speciesName,
}: HexagonalRadarChartProps) {
  const center = size / 2;
  const outerRadius = size * 0.38;
  const innerRadius = outerRadius * 0.15;
  
  // Calculate positions for each axis
  const axisAngles = useMemo(() => {
    return Array.from({ length: NUM_AXES }, (_, i) => {
      return ANGLE_OFFSET + (2 * Math.PI * i) / NUM_AXES;
    });
  }, []);
  
  // Calculate point on circle given angle and radius
  const getPoint = (angle: number, radius: number) => ({
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  });
  
  // Generate polygon points for a given radius
  const generatePolygonPoints = (radius: number): string => {
    return axisAngles
      .map((angle) => {
        const point = getPoint(angle, radius);
        return `${point.x},${point.y}`;
      })
      .join(' ');
  };
  
  // Generate data polygon based on scores
  const dataPolygonPoints = useMemo(() => {
    return parameterScores
      .map((ps, i) => {
        const scoreRadius = innerRadius + (outerRadius - innerRadius) * (ps.score / 2);
        const angle = axisAngles[i];
        const point = getPoint(angle, scoreRadius);
        return `${point.x},${point.y}`;
      })
      .join(' ');
  }, [parameterScores, axisAngles, innerRadius, outerRadius, center]);
  
  // Get color for grade
  const getGradeColor = (grade: 'A' | 'B' | 'C') => {
    switch (grade) {
      case 'A':
        return '#10b981'; // Green
      case 'B':
        return '#f59e0b'; // Yellow/Orange
      case 'C':
        return '#ef4444'; // Red
    }
  };
  
  // Concentric rings for scale (A, B, C levels)
  const scaleRings = [
    { level: 'C', radius: innerRadius + (outerRadius - innerRadius) * 0.15 },
    { level: 'D', radius: innerRadius + (outerRadius - innerRadius) * 0.35 },
    { level: 'B', radius: innerRadius + (outerRadius - innerRadius) * 0.55 },
    { level: 'B', radius: innerRadius + (outerRadius - innerRadius) * 0.75 },
    { level: 'A', radius: outerRadius },
  ];
  
  // Golden ring segments (decorative ticks)
  const numTicks = 72;
  const tickMarks = useMemo(() => {
    return Array.from({ length: numTicks }, (_, i) => {
      const angle = (2 * Math.PI * i) / numTicks;
      const isLong = i % 6 === 0;
      const innerR = outerRadius + 4;
      const outerR = innerR + (isLong ? 8 : 4);
      return {
        x1: center + innerR * Math.cos(angle),
        y1: center + innerR * Math.sin(angle),
        x2: center + outerR * Math.cos(angle),
        y2: center + outerR * Math.sin(angle),
        isLong,
      };
    });
  }, [center, outerRadius]);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
    >
      <defs>
        {/* Gradient for golden ring */}
        <linearGradient id="goldenRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        
        {/* Gradient for data polygon */}
        <linearGradient id="dataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6" />
        </linearGradient>
        
        {/* Drop shadow */}
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>
      
      {/* Outer golden ring background */}
      <circle
        cx={center}
        cy={center}
        r={outerRadius + 15}
        fill="url(#goldenRing)"
        filter="url(#dropShadow)"
      />
      
      {/* White inner background */}
      <circle
        cx={center}
        cy={center}
        r={outerRadius + 6}
        fill="#FFFEF7"
      />
      
      {/* Tick marks on golden ring */}
      {tickMarks.map((tick, i) => (
        <line
          key={i}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          stroke="#8B7355"
          strokeWidth={tick.isLong ? 1.5 : 0.75}
          opacity={0.6}
        />
      ))}
      
      {/* Concentric scale polygons */}
      {scaleRings.map((ring, i) => (
        <polygon
          key={i}
          points={generatePolygonPoints(ring.radius)}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={1}
          strokeDasharray={i === scaleRings.length - 1 ? 'none' : '2,2'}
        />
      ))}
      
      {/* Axis lines */}
      {axisAngles.map((angle, i) => {
        const outer = getPoint(angle, outerRadius);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={outer.x}
            y2={outer.y}
            stroke="#D1D5DB"
            strokeWidth={1}
          />
        );
      })}
      
      {/* Data polygon (current scores) */}
      <polygon
        points={dataPolygonPoints}
        fill="url(#dataGradient)"
        stroke="#3B82F6"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      
      {/* Data points with grade colors */}
      {parameterScores.map((ps, i) => {
        const scoreRadius = innerRadius + (outerRadius - innerRadius) * (ps.score / 2);
        const angle = axisAngles[i];
        const point = getPoint(angle, scoreRadius);
        return (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={6}
            fill={getGradeColor(ps.grade)}
            stroke="white"
            strokeWidth={2}
          />
        );
      })}
      
      {/* Grade labels at each axis */}
      {parameterScores.map((ps, i) => {
        const labelRadius = outerRadius + 28;
        const angle = axisAngles[i];
        const point = getPoint(angle, labelRadius);
        return (
          <text
            key={`grade-${i}`}
            x={point.x}
            y={point.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={getGradeColor(ps.grade)}
            fontSize={16}
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
          >
            {ps.grade}
          </text>
        );
      })}
      
      {/* Parameter labels */}
      {parameterScores.map((ps, i) => {
        const labelRadius = outerRadius + 48;
        const angle = axisAngles[i];
        const point = getPoint(angle, labelRadius);
        
        // Adjust text anchor based on position
        let textAnchor: 'start' | 'middle' | 'end' = 'middle';
        if (Math.cos(angle) < -0.3) textAnchor = 'end';
        else if (Math.cos(angle) > 0.3) textAnchor = 'start';
        
        // Shorter labels for mobile
        const shortLabels: Record<string, string> = {
          'Dissolved Oxygen': 'DO',
          'Ammonia (TAN)': 'NH₃',
          'Alkalinity': 'Alk',
          'Temperature': 'Temp',
          'Salinity': 'Sal',
          'TSS': 'TSS',
          'pH': 'pH',
        };
        
        return (
          <text
            key={`label-${i}`}
            x={point.x}
            y={point.y}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            fill="#374151"
            fontSize={11}
            fontWeight="500"
            fontFamily="Arial, sans-serif"
          >
            {shortLabels[ps.label] || ps.label}
          </text>
        );
      })}
      
      {/* Center scale labels */}
      <text
        x={center}
        y={center - 5}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#9CA3AF"
        fontSize={8}
        fontFamily="Arial, sans-serif"
      >
        A
      </text>
      <text
        x={center}
        y={center + 5}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#9CA3AF"
        fontSize={7}
        fontFamily="Arial, sans-serif"
      >
        B C
      </text>
    </svg>
  );
}

