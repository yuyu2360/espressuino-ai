import { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMachineStore } from '../store/machineStore';
import { useAuthStore } from '../store/authStore';
import { useBrewProfileStore } from '../store/brewProfileStore';
import { Gauge } from '../components/Gauge';
import { Header } from '../components/Header';
import { ControlPanel } from '../components/ControlPanel';
import { AlertDisplay } from '../components/AlertDisplay';
import { TemperatureGraph } from '../components/TemperatureGraph';
import { PressureGraph } from '../components/PressureGraph';
import { BrewProfileSelector } from '../components/BrewProfileSelector';
import '../styles/DashboardPage.css';

export function DashboardPage() {
  const { isConnected, sensorData, sendCommand } = useWebSocket();
  const {
    sensorData: machineData,
    isBrewing,
    currentAlert,
    recordedTemperatureData,
    recordedPressureData,
    setSensorData,
    setConnected,
    startBrewing,
    stopBrewing,
    recordDataPoint,
    checkAlerts,
    setAlert,
  } = useMachineStore();
  const { settings } = useAuthStore();
  const { currentProfile } = useBrewProfileStore();

  const [targetTemp, setTargetTemp] = useState(currentProfile?.targetTemperature || 92);
  const [goalPressure, setGoalPressure] = useState(currentProfile?.goalPressure || 9);
  const [brewTimeTarget, setBrewTimeTarget] = useState(currentProfile?.brewingTimeTarget || 28);
  const [brewDisplayMode, setBrewDisplayMode] = useState<'countdown' | 'count-up'>(
    settings?.brewTimeDisplayMode || 'count-up'
  );

  const handleProfileChange = (profile: any) => {
    if (profile && !isBrewing) {
      setTargetTemp(profile.targetTemperature);
      setGoalPressure(profile.goalPressure);
      setBrewTimeTarget(profile.brewingTimeTarget);
    }
  };

  useEffect(() => {
    setConnected(isConnected);
  }, [isConnected, setConnected]);

  useEffect(() => {
    if (sensorData) {
      setSensorData(sensorData);

      if (isBrewing) {
        recordDataPoint();
      }

      const alert = checkAlerts(targetTemp, goalPressure, brewTimeTarget);
      if (alert && (!currentAlert || alert.type !== currentAlert.type)) {
        setAlert(alert);
      }
    }
  }, [sensorData, isBrewing, targetTemp, goalPressure, brewTimeTarget]);

  if (!machineData) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Initializing machine...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Header />

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Espresso Brewing Dashboard</h1>
          <div className="header-right">
            <BrewProfileSelector onProfileChange={handleProfileChange} />
            <div className="connection-status">
              <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>

        {currentAlert && <AlertDisplay alert={currentAlert} onDismiss={() => setAlert(null)} />}

        <div className="dashboard-grid">
          <div className="gauges-section">
            <div className="gauges-row">
              <Gauge
                value={machineData.temperature}
                target={targetTemp}
                min={20}
                max={110}
                label="Temperature"
                unit="°C"
                zones={{
                  safe: [targetTemp - 3, targetTemp + 3],
                  warning: [targetTemp - 5, targetTemp + 5],
                  critical: [targetTemp - 10, targetTemp + 10],
                }}
              />
              <Gauge
                value={machineData.pressure}
                target={goalPressure}
                min={0}
                max={15}
                label="Pressure"
                unit="bar"
                zones={{
                  safe: [goalPressure - 0.5, goalPressure + 0.5],
                  warning: [goalPressure - 1, goalPressure + 1],
                  critical: [goalPressure - 2, goalPressure + 2],
                }}
              />
            </div>

            <div className="status-cards">
              <div className="status-card">
                <div className="status-label">Status</div>
                <div className="status-value">{machineData.machineStatus.toUpperCase()}</div>
              </div>
              <div className="status-card">
                <div className="status-label">Mode</div>
                <div className="status-value">{machineData.machineMode.toUpperCase()}</div>
              </div>
              <div className="status-card">
                <div className="status-label">Shot Weight</div>
                <div className="status-value">{machineData.shotWeight.toFixed(1)}g</div>
              </div>
              <div className="status-card">
                <div className="status-label">Brew Time</div>
                <div className="status-value">{machineData.brewingTime}s</div>
              </div>
            </div>
          </div>

          <ControlPanel
            onSendCommand={sendCommand}
            targetTemp={targetTemp}
            onTargetTempChange={setTargetTemp}
            goalPressure={goalPressure}
            onGoalPressureChange={setGoalPressure}
            brewTimeTarget={brewTimeTarget}
            onBrewTimeTargetChange={setBrewTimeTarget}
            isBrewing={isBrewing}
            onStartBrew={startBrewing}
            onStopBrew={stopBrewing}
          />
        </div>

        {isBrewing && (
          <div className="graphs-section">
            <div className="graphs-header">
              <h2>Live Brew Data</h2>
              <button
                className="btn-display-mode"
                onClick={() => setBrewDisplayMode(brewDisplayMode === 'countdown' ? 'count-up' : 'countdown')}
              >
                {brewDisplayMode === 'countdown' ? 'Countdown' : 'Count-up'} Mode
              </button>
            </div>

            <div className="graphs-grid">
              <TemperatureGraph
                data={recordedTemperatureData}
                targetTemp={targetTemp}
                currentTemp={machineData.temperature}
              />
              <PressureGraph
                data={recordedPressureData}
                goalPressure={goalPressure}
                currentPressure={machineData.pressure}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
