import { useState } from 'react';
import type { Command } from '../types';
import '../styles/ControlPanel.css';

interface ControlPanelProps {
  onSendCommand: (command: Command) => void;
  targetTemp?: number;
  onTargetTempChange: (temp: number) => void;
  goalPressure?: number;
  onGoalPressureChange: (pressure: number) => void;
  brewTimeTarget?: number;
  onBrewTimeTargetChange: (time: number) => void;
  isBrewing: boolean;
  onStartBrew: () => void;
  onStopBrew: () => void;
}

export function ControlPanel({
  onSendCommand,
  targetTemp,
  onTargetTempChange,
  goalPressure,
  onGoalPressureChange,
  brewTimeTarget,
  onBrewTimeTargetChange,
  isBrewing,
  onStartBrew,
  onStopBrew,
}: ControlPanelProps) {
  const [machineOn, setMachineOn] = useState(false);
  const [machineMode, setMachineMode] = useState<'coffee' | 'steam'>('coffee');

  const handleMachineToggle = () => {
    const newState = !machineOn;
    setMachineOn(newState);
    onSendCommand({
      type: newState ? 'machine_on' : 'machine_off',
      timestamp: Date.now(),
    });
  };

  const handleModeSwitch = (mode: 'coffee' | 'steam') => {
    setMachineMode(mode);
    onSendCommand({
      type: 'mode_switch',
      value: mode,
      timestamp: Date.now(),
    });
  };

  const handleStartBrew = () => {
    onStartBrew();
    onSendCommand({
      type: 'start_brew',
      timestamp: Date.now(),
    });
  };

  const handleStopBrew = () => {
    onStopBrew();
    onSendCommand({
      type: 'stop_brew',
      timestamp: Date.now(),
    });
  };

  const handleTempChange = (newTemp: number) => {
    onTargetTempChange(newTemp);
    onSendCommand({
      type: 'temperature',
      value: newTemp,
      timestamp: Date.now(),
    });
  };

  const handlePressureChange = (newPressure: number) => {
    onGoalPressureChange(newPressure);
    onSendCommand({
      type: 'pressure',
      value: newPressure,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="control-panel">
      <h2>Machine Controls</h2>

      <div className="control-group">
        <label>Machine Power</label>
        <button
          className={`btn-machine-toggle ${machineOn ? 'on' : 'off'}`}
          onClick={handleMachineToggle}
        >
          {machineOn ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="control-group">
        <label>Mode</label>
        <div className="mode-buttons">
          <button
            className={`btn-mode ${machineMode === 'coffee' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('coffee')}
            disabled={!machineOn}
          >
            Coffee
          </button>
          <button
            className={`btn-mode ${machineMode === 'steam' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('steam')}
            disabled={!machineOn}
          >
            Steam
          </button>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="temp-slider">
          Target Temperature: <strong>{(targetTemp || 92).toFixed(0)}°C</strong>
        </label>
        <input
          id="temp-slider"
          type="range"
          min="80"
          max="105"
          step="0.5"
          value={targetTemp || 92}
          onChange={(e) => handleTempChange(parseFloat(e.target.value))}
          className="slider"
          disabled={!machineOn}
        />
      </div>

      <div className="control-group">
        <label htmlFor="pressure-slider">
          Goal Pressure: <strong>{(goalPressure || 9).toFixed(1)} bar</strong>
        </label>
        <input
          id="pressure-slider"
          type="range"
          min="0"
          max="15"
          step="0.1"
          value={goalPressure || 9}
          onChange={(e) => handlePressureChange(parseFloat(e.target.value))}
          className="slider"
          disabled={!machineOn}
        />
      </div>

      <div className="control-group">
        <label htmlFor="brew-time-slider">
          Brew Time Target: <strong>{(brewTimeTarget || 28)}s</strong>
        </label>
        <input
          id="brew-time-slider"
          type="range"
          min="15"
          max="60"
          step="1"
          value={brewTimeTarget || 28}
          onChange={(e) => onBrewTimeTargetChange(parseInt(e.target.value))}
          className="slider"
          disabled={isBrewing}
        />
      </div>

      <div className="control-group">
        {!isBrewing ? (
          <button className="btn-brew" onClick={handleStartBrew} disabled={!machineOn}>
            Start Brew
          </button>
        ) : (
          <button className="btn-brew btn-brew-stop" onClick={handleStopBrew}>
            Stop Brew
          </button>
        )}
      </div>
    </div>
  );
}
