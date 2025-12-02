import React from 'react';
import '../styles/DualGauge.css';

interface DualGaugeProps {
  temp: number;
  targetTemp: number;
  pressure: number;
  targetPressure: number;
}

export const DualGauge: React.FC<DualGaugeProps> = ({
  temp,
  targetTemp,
  pressure
}) => {
  // CONFIGURATION
  const size = 300;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Scale Limits
  const minTemp = 20, maxTemp = 120;
  const minPress = 0, maxPress = 12;

  // Normalization (0 to 1)
  const tempPct = Math.min(1, Math.max(0, (temp - minTemp) / (maxTemp - minTemp)));
  const pressPct = Math.min(1, Math.max(0, (pressure - minPress) / (maxPress - minPress)));

  // Helper to get circle coordinates
  const getCoords = (angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180.0);
    return {
      x: center + (radius * Math.cos(angleInRadians)),
      y: center + (radius * Math.sin(angleInRadians))
    };
  };

  // --- SVG PATH GENERATOR ---
  // Direction: 1 for Right (Pressure), -1 for Left (Temp)
  const describeArc = (startAngle: number, endAngle: number) => {
    const start = getCoords(endAngle);
    const end = getCoords(startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  // CALCULATE PATHS
  // Pressure (Right Side): From 15° to 165° (standard clock, bottom to top)
  // Correct rotation logic: 0 is top. 180 is bottom.
  // Let's work in standard SVG degrees where 0 is right (3 o'clock).
  // To simplify, we rotate the whole SVG or do math relative to vertical.
  
  // Dash sizing
  const dashSize = 4;
  const gapSize = 4;

  // --- LEFT GAUGE (TEMP) ---
  // Range: 195 deg to 345 deg (sweeping clockwise? No, bottom to top)
  // Let's say Bottom is 180. Top is 0.
  // Left gauge: Starts 195, ends 345.
  const leftTotalAngle = 150;
  const leftActiveAngle = leftTotalAngle * tempPct;

  // --- RIGHT GAUGE (PRESSURE) ---
  // Range: 165 deg to 15 deg (sweeping counter-clockwise)
  // Let's use 165 down to 15.
  // For SVG path: Start at Bottom (165), End at Top (15).
  // Total sweep 150 deg.
  const rightTotalAngle = 150;
  const rightActiveAngle = rightTotalAngle * pressPct;

  return (
    <div className="dual-gauge-container">
      {/* VALUE READOUTS (Top Corners) */}
      <div className="readout-overlay">
        <div className="readout left">
          <span className="label">TEMP</span>
          <span className="value">{temp.toFixed(1)}°C</span>
        </div>
        <div className="readout right">
          <span className="label">PRESSURE</span>
          <span className="value">{pressure.toFixed(1)} bar</span>
        </div>
      </div>

      <svg width={size} height={size} className="dual-gauge-svg">
        <defs>
          <linearGradient id="gradTemp" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" /> {/* Red Bottom */}
            <stop offset="100%" stopColor="#f87171" /> {/* Light Red Top */}
          </linearGradient>
          <linearGradient id="gradPress" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" /> {/* Blue Bottom */}
            <stop offset="100%" stopColor="#60a5fa" /> {/* Light Blue Top */}
          </linearGradient>
        </defs>

        {/* --- RIGHT GAUGE (PRESSURE) --- */}
        {/* Background Track */}
        <path 
          d={describeArc(-165, -15)} // Negative for right side math
          fill="none" 
          stroke="#334155" 
          strokeWidth={strokeWidth}
          strokeDasharray={`${dashSize} ${gapSize}`}
        />
        {/* Active Fill */}
        <path 
          d={describeArc(-165, -(165 - rightActiveAngle))} 
          fill="none" 
          stroke="url(#gradPress)" 
          strokeWidth={strokeWidth}
          strokeDasharray={`${dashSize} ${gapSize}`}
          className="gauge-anim"
        />

        {/* --- LEFT GAUGE (TEMP) --- */}
        {/* Background Track */}
        <path 
          d={describeArc(165, 15)} // Positive for left side math
          fill="none" 
          stroke="#334155" 
          strokeWidth={strokeWidth}
          strokeDasharray={`${dashSize} ${gapSize}`}
        />
        {/* Active Fill */}
        <path 
          d={describeArc(165, 165 - leftActiveAngle)} 
          fill="none" 
          stroke="url(#gradTemp)" 
          strokeWidth={strokeWidth}
          strokeDasharray={`${dashSize} ${gapSize}`}
          className="gauge-anim"
        />
      </svg>

      {/* CENTER STATUS */}
      <div className="center-info">
        <div className="profile-label">Active Profile</div>
        <div className="profile-name">Manual Control</div>
        <div className="mini-stats">
            <span className="target-temp">Target: {targetTemp}°</span>
        </div>
      </div>
    </div>
  );
};