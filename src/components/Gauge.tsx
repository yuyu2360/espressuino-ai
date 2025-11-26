
import '../styles/Gauge.css';

interface GaugeProps {
  value: number;
  target?: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  zones?: {
    safe: [number, number];
    warning: [number, number];
    critical: [number, number];
  };
}

export function Gauge({ value, target, min, max, label, unit, zones }: GaugeProps) {
  const normalizedValue = Math.max(min, Math.min(max, value));
  const percentage = ((normalizedValue - min) / (max - min)) * 100;
  const angle = (percentage / 100) * 270 - 135;

  let zoneClass = '';
  if (zones) {
    if (normalizedValue < zones.warning[0] || normalizedValue > zones.warning[1]) {
      zoneClass = 'warning';
    }
    if (normalizedValue < zones.critical[0] || normalizedValue > zones.critical[1]) {
      zoneClass = 'critical';
    } else if (normalizedValue >= zones.safe[0] && normalizedValue <= zones.safe[1]) {
      zoneClass = 'safe';
    }
  }

  const radiusWithoutStroke = 85;
  const needleStartRadius = 35;
  const needleEndRadius = radiusWithoutStroke - 10;
  const radians = (angle * Math.PI) / 180;

  const needleStartX = 100 + needleStartRadius * Math.cos(radians);
  const needleStartY = 100 + needleStartRadius * Math.sin(radians);
  const needleEndX = 100 + needleEndRadius * Math.cos(radians);
  const needleEndY = 100 + needleEndRadius * Math.sin(radians);

  const getArcPath = (radius: number, startPercentage: number, endPercentage: number) => {
    const startAngle = (startPercentage / 100) * 270 - 135;
    const endAngle = (endPercentage / 100) * 270 - 135;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = 100 + radius * Math.cos(startRad);
    const y1 = 100 + radius * Math.sin(startRad);
    const x2 = 100 + radius * Math.cos(endRad);
    const y2 = 100 + radius * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const targetPercentage = target !== undefined ? ((target - min) / (max - min)) * 100 : null;

  return (
    <div className={`gauge ${zoneClass}`}>
      <div className="gauge-background">
        <svg viewBox="0 0 200 200" className="gauge-svg">
          <defs>
            <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="1" />
            </linearGradient>
          </defs>

          <circle cx="100" cy="100" r="85" className="gauge-track" />

          <path
            d={getArcPath(85, 0, 100)}
            className={`gauge-fill ${zoneClass}`}
            strokeDasharray={`${(percentage / 100) * 447.7} 447.7`}
          />

          {targetPercentage !== null && (
            <circle
              cx={100 + 85 * Math.cos((((targetPercentage / 100) * 270 - 135) * Math.PI) / 180)}
              cy={100 + 85 * Math.sin((((targetPercentage / 100) * 270 - 135) * Math.PI) / 180)}
              r="4"
              className="gauge-target-marker"
            />
          )}

          <line
            x1={needleStartX}
            y1={needleStartY}
            x2={needleEndX}
            y2={needleEndY}
            className="gauge-needle"
          />
          <circle cx="100" cy="100" r="10" className="gauge-center" />
        </svg>
      </div>

      <div className="gauge-content">
        <div className="gauge-label">{label}</div>
        <div className="gauge-value">
          <span className="value">{normalizedValue.toFixed(1)}</span>
          <span className="unit">{unit}</span>
        </div>
        {target !== undefined && <div className="gauge-target">Target: {target.toFixed(1)}</div>}
      </div>
    </div>
  );
}
