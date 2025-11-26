
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DataPoint } from '../types';
import '../styles/Graph.css';

interface PressureGraphProps {
  data: DataPoint[];
  goalPressure: number;
  currentPressure: number;
}

export function PressureGraph({ data, goalPressure, currentPressure }: PressureGraphProps) {
  const chartData = data.map((point, index) => ({
    time: index,
    pressure: point.value,
  }));

  const minPressure = Math.min(...(data.map((d) => d.value) || [goalPressure]), goalPressure) - 1;
  const maxPressure = Math.max(...(data.map((d) => d.value) || [goalPressure]), goalPressure) + 2;

  return (
    <div className="graph-container">
      <h3 className="graph-title">Pressure</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="time"
            stroke="var(--color-text-tertiary)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            domain={[minPressure, maxPressure]}
            stroke="var(--color-text-tertiary)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: `1px solid var(--color-border)`,
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text)',
            }}
          />
          <Line
            type="monotone"
            dataKey="pressure"
            stroke="var(--color-accent)"
            dot={false}
            isAnimationActive={true}
            name="Pressure"
          />
          <line
            x1="0"
            y1={goalPressure}
            x2="100%"
            y2={goalPressure}
            stroke="var(--color-primary)"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="graph-stats">
        <div className="stat">
          <span className="stat-label">Current:</span>
          <span className="stat-value">{currentPressure.toFixed(1)} bar</span>
        </div>
        <div className="stat">
          <span className="stat-label">Goal:</span>
          <span className="stat-value">{goalPressure.toFixed(1)} bar</span>
        </div>
      </div>
    </div>
  );
}
