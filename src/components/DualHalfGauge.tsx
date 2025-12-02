import '../styles/DualHalfGauge.css';
import { useMemo } from 'react';

interface DualHalfGaugeProps {
  temperature: number;
  targetTemperature: number;
  pressure: number;
  targetPressure: number;
  minTemp?: number;
  maxTemp?: number;
  minPressure?: number;
  maxPressure?: number;
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, sweepFlag: number) {
  const startPoint = polarToCartesian(x, y, radius, startAngle);
  const endPoint = polarToCartesian(x, y, radius, endAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1';

  return [
    'M', startPoint.x, startPoint.y,
    'A', radius, radius, 0, largeArcFlag, sweepFlag, endPoint.x, endPoint.y,
  ].join(' ');
}

export function DualHalfGauge({
  temperature = 0,
  targetTemperature = 92,
  pressure = 0,
  targetPressure = 9,
  minTemp = 20,
  maxTemp = 120,
  minPressure = 0,
  maxPressure = 12,
}: DualHalfGaugeProps) {
  const temp = temperature ?? 0;
  const targetTemp = targetTemperature ?? 92;
  const pres = pressure ?? 0;
  const targetPres = targetPressure ?? 9;

  const tempPercent = Math.max(0, Math.min(1, (temp - minTemp) / (maxTemp - minTemp)));
  const pressurePercent = Math.max(0, Math.min(1, (pres - minPressure) / (maxPressure - minPressure)));

  const radius = 130;
  const center = 170;

  const paths = useMemo(() => {
    const leftPathFull = describeArc(center, center, radius, 210, 330, 1);
    const rightPathFull = describeArc(center, center, radius, 150, 30, 0);
    return { leftPathFull, rightPathFull };
  }, []);

  const leftPathLength = 2 * Math.PI * radius * (120 / 360);
  const rightPathLength = 2 * Math.PI * radius * (120 / 360);

  const leftVisibleLength = leftPathLength * tempPercent;
  const rightVisibleLength = rightPathLength * pressurePercent;

  return (
    <div className="dual-half-gauge">
      <div className="gauge-container">
        <div className="readout-overlay">
          <div className="readout-group readout-left">
            <span className="label">TEMP</span>
            <span className="value">
              {temp.toFixed(1)}
              <span className="unit">°C</span>
            </span>
          </div>
          <div className="readout-group readout-right">
            <span className="label">PRESSURE</span>
            <span className="value">
              {pres.toFixed(1)}
              <span className="unit">bar</span>
            </span>
          </div>
        </div>

        <svg width="340" height="340" viewBox="0 0 340 340" className="gauge-svg">
          <defs>
            <linearGradient id="gradTemp" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="40%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
            <linearGradient id="gradPress" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#991b1b" />
              <stop offset="40%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#fca5a5" />
            </linearGradient>

            <mask id="maskTemp">
              <path
                fill="none"
                stroke="white"
                strokeWidth="24"
                strokeDasharray={`${leftVisibleLength} ${leftPathLength}`}
                strokeLinecap="butt"
                d={paths.leftPathFull}
              />
            </mask>

            <mask id="maskPress">
              <path
                fill="none"
                stroke="white"
                strokeWidth="24"
                strokeDasharray={`${rightVisibleLength} ${rightPathLength}`}
                strokeLinecap="butt"
                d={paths.rightPathFull}
              />
            </mask>
          </defs>

          <path
            fill="none"
            stroke="#1e293b"
            strokeWidth="24"
            strokeDasharray="5 7"
            strokeLinecap="butt"
            d={paths.leftPathFull}
          />
          <path
            fill="none"
            stroke="url(#gradTemp)"
            strokeWidth="24"
            strokeDasharray="5 7"
            strokeLinecap="butt"
            mask="url(#maskTemp)"
            d={paths.leftPathFull}
          />

          <path
            fill="none"
            stroke="#1e293b"
            strokeWidth="24"
            strokeDasharray="5 7"
            strokeLinecap="butt"
            d={paths.rightPathFull}
          />
          <path
            fill="none"
            stroke="url(#gradPress)"
            strokeWidth="24"
            strokeDasharray="5 7"
            strokeLinecap="butt"
            mask="url(#maskPress)"
            d={paths.rightPathFull}
          />
        </svg>

        <div className="center-status">
          <div className="center-label">TARGET</div>
          <div className="center-target">
            {targetTemp.toFixed(0)}° <span className="divider">|</span> {targetPres.toFixed(1)} bar
          </div>
        </div>
      </div>
    </div>
  );
}
