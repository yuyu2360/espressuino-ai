import '../styles/DualHalfGauge.css';

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

export function DualHalfGauge({
  temperature = 0,
  targetTemperature = 92,
  pressure = 0,
  targetPressure = 9,
  minTemp = 70,
  maxTemp = 110,
  minPressure = 0,
  maxPressure = 15,
}: DualHalfGaugeProps) {
  const temp = temperature ?? 0;
  const targetTemp = targetTemperature ?? 92;
  const pres = pressure ?? 0;
  const targetPres = targetPressure ?? 9;

  const getTempPercentage = () => (temp - minTemp) / (maxTemp - minTemp);
  const getPressurePercentage = () => (pres - minPressure) / (maxPressure - minPressure);
  const getTargetTempPercentage = () => (targetTemp - minTemp) / (maxTemp - minTemp);
  const getTargetPressurePercentage = () => (targetPres - minPressure) / (maxPressure - minPressure);

  const tempPercent = Math.max(0, Math.min(1, getTempPercentage()));
  const pressurePercent = Math.max(0, Math.min(1, getPressurePercentage()));
  const targetTempPercent = Math.max(0, Math.min(1, getTargetTempPercentage()));
  const targetPressurePercent = Math.max(0, Math.min(1, getTargetPressurePercentage()));

  const tempDegrees = tempPercent * 180;
  const pressureDegrees = pressurePercent * 180;
  const targetTempDegrees = targetTempPercent * 180;
  const targetPressureDegrees = targetPressurePercent * 180;

  return (
    <div className="dual-half-gauge">
      <svg viewBox="0 0 400 220" className="gauge-svg">
        <defs>
          <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-error)" />
            <stop offset="50%" stopColor="var(--color-warning)" />
            <stop offset="100%" stopColor="var(--color-success)" />
          </linearGradient>
          <linearGradient id="pressureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-success)" />
            <stop offset="50%" stopColor="var(--color-info)" />
            <stop offset="100%" stopColor="var(--color-error)" />
          </linearGradient>
        </defs>

        <g className="temp-half">
          <circle cx="100" cy="200" r="100" className="gauge-bg" />
          <circle cx="100" cy="200" r="90" className="gauge-track" />

          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * 180;
            const rad = (angle * Math.PI) / 180;
            const x1 = 100 + 90 * Math.cos(rad);
            const y1 = 200 - 90 * Math.sin(rad);
            const x2 = 100 + 80 * Math.cos(rad);
            const y2 = 200 - 80 * Math.sin(rad);
            return (
              <line
                key={`temp-tick-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="gauge-tick"
                stroke={i % 3 === 0 ? 'var(--color-text)' : 'var(--color-text-tertiary)'}
              />
            );
          })}

          <path
            d={`M ${100 + 85 * Math.cos((0 * Math.PI) / 180)} ${200 - 85 * Math.sin((0 * Math.PI) / 180)}
               A 85 85 0 0 0 ${100 + 85 * Math.cos((tempDegrees * Math.PI) / 180)} ${200 - 85 * Math.sin((tempDegrees * Math.PI) / 180)}`}
            className="gauge-value"
            fill="none"
            stroke="var(--color-warning)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          <circle
            cx={100 + 75 * Math.cos((targetTempDegrees * Math.PI) / 180)}
            cy={200 - 75 * Math.sin((targetTempDegrees * Math.PI) / 180)}
            r="4"
            className="target-marker"
            fill="white"
          />

          <text x="100" y="210" className="gauge-label">
            Temperature
          </text>
        </g>

        <g className="pressure-half">
          <circle cx="300" cy="200" r="100" className="gauge-bg" />
          <circle cx="300" cy="200" r="90" className="gauge-track" />

          {[...Array(12)].map((_, i) => {
            const angle = 180 - (i / 12) * 180;
            const rad = (angle * Math.PI) / 180;
            const x1 = 300 + 90 * Math.cos(rad);
            const y1 = 200 - 90 * Math.sin(rad);
            const x2 = 300 + 80 * Math.cos(rad);
            const y2 = 200 - 80 * Math.sin(rad);
            return (
              <line
                key={`pressure-tick-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="gauge-tick"
                stroke={i % 3 === 0 ? 'var(--color-text)' : 'var(--color-text-tertiary)'}
              />
            );
          })}

          <path
            d={`M ${300 + 85 * Math.cos((180 * Math.PI) / 180)} ${200 - 85 * Math.sin((180 * Math.PI) / 180)}
               A 85 85 0 0 1 ${300 + 85 * Math.cos(((180 - pressureDegrees) * Math.PI) / 180)} ${200 - 85 * Math.sin(((180 - pressureDegrees) * Math.PI) / 180)}`}
            className="gauge-value"
            fill="none"
            stroke="var(--color-info)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          <circle
            cx={300 + 75 * Math.cos(((180 - targetPressureDegrees) * Math.PI) / 180)}
            cy={200 - 75 * Math.sin(((180 - targetPressureDegrees) * Math.PI) / 180)}
            r="4"
            className="target-marker"
            fill="white"
          />

          <text x="300" y="210" className="gauge-label">
            Pressure
          </text>
        </g>

        <g className="center-display">
          <rect x="150" y="80" width="100" height="80" rx="8" className="center-bg" />
          <text x="200" y="105" className="center-temp">
            {temp.toFixed(0)}°C
          </text>
          <text x="200" y="150" className="center-pressure">
            {pres.toFixed(1)} bar
          </text>
        </g>
      </svg>

      <div className="gauge-stats">
        <div className="stat-column">
          <div className="stat-item">
            <span className="stat-label">Temperature</span>
            <span className="stat-value temp-value">{temp.toFixed(1)}°C</span>
            <span className="stat-target">Target: {targetTemp.toFixed(0)}°C</span>
          </div>
        </div>
        <div className="stat-column">
          <div className="stat-item">
            <span className="stat-label">Pressure</span>
            <span className="stat-value pressure-value">{pres.toFixed(1)} bar</span>
            <span className="stat-target">Target: {targetPres.toFixed(1)} bar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
