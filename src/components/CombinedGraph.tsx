import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DataPoint } from '../types';
import '../styles/Graph.css';

interface CombinedGraphProps {
  temperatureData: DataPoint[];
  pressureData: DataPoint[];
  targetTemp: number;
  targetPressure: number;
  currentTemp: number;
  currentPressure: number;
}

export function CombinedGraph({
  temperatureData,
  pressureData,
  targetTemp,
  targetPressure,
  currentTemp,
  currentPressure,
}: CombinedGraphProps) {
  const chartData = temperatureData.map((point, index) => ({
    time: index,
    temperature: point.value,
    pressure: pressureData[index]?.value || 0,
  }));

  const minTemp = Math.min(...(temperatureData.map((d) => d.value) || [targetTemp]), targetTemp) - 5;
  const maxTemp = Math.max(...(temperatureData.map((d) => d.value) || [targetTemp]), targetTemp) + 5;
  const minPressure = 0;
  const maxPressure = Math.max(...(pressureData.map((d) => d.value) || [targetPressure]), targetPressure) + 2;

  return (
    <div className="graph-container">
      <h3 className="graph-title">Brew Profile</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="time" stroke="var(--color-text-tertiary)" style={{ fontSize: '12px' }} />
          <YAxis
            yAxisId="left"
            domain={[minTemp, maxTemp]}
            stroke="var(--color-warning)"
            style={{ fontSize: '12px' }}
            label={{ value: '°C', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[minPressure, maxPressure]}
            stroke="var(--color-info)"
            style={{ fontSize: '12px' }}
            label={{ value: 'bar', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: `1px solid var(--color-border)`,
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text)',
            }}
            formatter={(value) => {
              if (typeof value === 'number') {
                return value.toFixed(1);
              }
              return value;
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temperature"
            stroke="var(--color-warning)"
            dot={false}
            isAnimationActive={true}
            name="Temperature (°C)"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="pressure"
            stroke="var(--color-info)"
            dot={false}
            isAnimationActive={true}
            name="Pressure (bar)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="graph-stats-combined">
        <div className="stat-group">
          <div className="stat">
            <span className="stat-label">Temperature:</span>
            <span className="stat-value" style={{ color: 'var(--color-warning)' }}>{currentTemp.toFixed(1)}°C</span>
          </div>
          <div className="stat">
            <span className="stat-label">Target:</span>
            <span className="stat-value" style={{ color: 'var(--color-warning)' }}>{targetTemp.toFixed(1)}°C</span>
          </div>
        </div>
        <div className="stat-group">
          <div className="stat">
            <span className="stat-label">Pressure:</span>
            <span className="stat-value" style={{ color: 'var(--color-info)' }}>{currentPressure.toFixed(1)} bar</span>
          </div>
          <div className="stat">
            <span className="stat-label">Target:</span>
            <span className="stat-value" style={{ color: 'var(--color-info)' }}>{targetPressure.toFixed(1)} bar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
