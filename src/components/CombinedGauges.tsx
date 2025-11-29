import { Gauge } from './Gauge';
import '../styles/CombinedGauges.css';

interface CombinedGaugesProps {
  temperature: number;
  targetTemperature: number;
  pressure: number;
  targetPressure: number;
}

export function CombinedGauges({
  temperature,
  targetTemperature,
  pressure,
  targetPressure,
}: CombinedGaugesProps) {
  return (
    <div className="combined-gauges">
      <div className="gauge-wrapper">
        <Gauge
          value={temperature}
          target={targetTemperature}
          min={70}
          max={110}
          label="Temperature"
          unit="°C"
          zones={{
            safe: [targetTemperature - 2, targetTemperature + 2],
            warning: [targetTemperature - 5, targetTemperature + 5],
            critical: [targetTemperature - 10, targetTemperature + 10],
          }}
        />
      </div>
      <div className="gauge-wrapper">
        <Gauge
          value={pressure}
          target={targetPressure}
          min={0}
          max={15}
          label="Pressure"
          unit="bar"
          zones={{
            safe: [targetPressure - 0.5, targetPressure + 0.5],
            warning: [targetPressure - 1, targetPressure + 1],
            critical: [targetPressure - 2, targetPressure + 2],
          }}
        />
      </div>
    </div>
  );
}
