
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DataPoint } from '../types';
import '../styles/Graph.css';

interface TemperatureGraphProps {
  data: DataPoint[];
  targetTemp: number;
  currentTemp: number;
}

export function TemperatureGraph({ data, targetTemp, currentTemp }: TemperatureGraphProps) {
  const chartData = data.map((point, index) => ({
    time: index,
    temperature: point.value,
  }));

  const minTemp = Math.min(...(data.map((d) => d.value) || [targetTemp]), targetTemp) - 5;
  const maxTemp = Math.max(...(data.map((d) => d.value) || [targetTemp]), targetTemp) + 5;

  return (
    <div className="graph-container">
      <h3 className="graph-title">Temperature</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="time"
            stroke="var(--color-text-tertiary)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            domain={[minTemp, maxTemp]}
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
            dataKey="temperature"
            stroke="var(--color-warning)"
            dot={false}
            isAnimationActive={true}
            name="Temperature"
          />
          <line
            x1="0"
            y1={targetTemp}
            x2="100%"
            y2={targetTemp}
            stroke="var(--color-primary)"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="graph-stats">
        <div className="stat">
          <span className="stat-label">Current:</span>
          <span className="stat-value">{currentTemp.toFixed(1)}°C</span>
        </div>
        <div className="stat">
          <span className="stat-label">Target:</span>
          <span className="stat-value">{targetTemp.toFixed(1)}°C</span>
        </div>
      </div>
    </div>
  );
}
