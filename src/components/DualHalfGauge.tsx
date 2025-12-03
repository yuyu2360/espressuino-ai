import "../styles/DualHalfGauge.css";
import { useMemo, useState, useEffect } from "react";

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
  minTemp = 20,
  maxTemp = 120,
  minPressure = 0,
  maxPressure = 12,
}: DualHalfGaugeProps) {
  const temp = temperature ?? 0;
  const targetTemp = targetTemperature ?? 92;
  const pres = pressure ?? 0;
  const targetPres = targetPressure ?? 9;

  const [activeTempTicks, setActiveTempTicks] = useState(0);
  const [activePressureTicks, setActivePressureTicks] = useState(0);

  const totalTicksSide = 25;
  const radius = 175;

  const tempPercent = Math.max(
    0,
    Math.min(1, (temp - minTemp) / (maxTemp - minTemp))
  );
  const pressurePercent = Math.max(
    0,
    Math.min(1, (pres - minPressure) / (maxPressure - minPressure))
  );

  const tempTicksActive = Math.round(totalTicksSide * tempPercent);
  const pressureTicksActive = Math.round(totalTicksSide * pressurePercent);

  useEffect(() => {
    setActiveTempTicks(tempTicksActive);
  }, [tempTicksActive]);

  useEffect(() => {
    setActivePressureTicks(pressureTicksActive);
  }, [pressureTicksActive]);

  const getTicks = (
    startAngle: number,
    endAngle: number,
    type: "left" | "right"
  ) => {
    const ticks = [];
    for (let i = 0; i < totalTicksSide; i++) {
      let angle: number;
      if (type === "left") {
        angle = startAngle + i * ((endAngle - startAngle) / totalTicksSide);
      } else {
        angle = startAngle - i * ((startAngle - endAngle) / totalTicksSide);
      }
      ticks.push({ id: i, angle });
    }
    return ticks;
  };

  const leftTicks = useMemo(() => getTicks(205, 335, "left"), []);

  const rightTicks = useMemo(() => getTicks(155, 25, "right"), []);

  const createTickElement = (angle: number, active: boolean, color: string) => {
    const angleInRadians = (angle - 90) * (Math.PI / 180);
    const x = 200 + radius * Math.cos(angleInRadians);
    const y = 200 + radius * Math.sin(angleInRadians);

    return (
      <g
        key={`tick-${angle}`}
        transform={`translate(${x}, ${y}) rotate(${angle})`}
      >
        <rect
          x="-4"
          y="-12"
          width="8"
          height="25"
          rx="4"
          fill={active ? color : "#94a3b8"}
          opacity={active ? 1 : 0.3}
          className={active ? "tick-active" : "tick-inactive"}
        />
      </g>
    );
  };

  return (
    <div className="dual-half-gauge">
      <div className="gauge-circle">
        <svg
          width="400"
          height="400"
          viewBox="0 0 400 400"
          className="gauge-svg"
        >
          <defs>
            <filter id="glow-temp">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-pressure">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            cx="200"
            cy="200"
            r="200"
            fill={`var(--color-bg-secondary)`}
          />

          <g id="tick-container">
            {leftTicks.map((tick) =>
              createTickElement(
                tick.angle,
                tick.id < activeTempTicks,
                "#ff3b3b"
              )
            )}
            {rightTicks.map((tick) =>
              createTickElement(
                tick.angle,
                tick.id < activePressureTicks,
                "#3b82f6"
              )
            )}
          </g>

          <text
            x="80"
            y="40"
            className="gauge-value-label"
            fill="white"
            textAnchor="middle"
          >
            {temp.toFixed(1)}°C
          </text>
          <text
            x="320"
            y="40"
            className="gauge-value-label"
            fill="white"
            textAnchor="middle"
          >
            {pres.toFixed(1)} bar
          </text>
        </svg>

        <div className="inner-content">
          <div className="center-target">
            <span className="target-value">{targetTemp.toFixed(0)}°</span>
            <span className="target-divider">|</span>
            <span className="target-value">{targetPres.toFixed(1)} bar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
