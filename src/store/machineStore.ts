import { create } from "zustand";
import type { SensorData, DataPoint, Alert } from "../types";

interface MachineStateStore {
  sensorData: SensorData | null;
  isConnected: boolean;
  isBrewing: boolean;
  brewingStartTime: number | null;
  currentAlert: Alert | null;
  recordedTemperatureData: DataPoint[];
  recordedPressureData: DataPoint[];
  recordedWeightData: DataPoint[];
  temperatureAlertThreshold: number;
  pressureAlertThreshold: number;

  setSensorData: (data: SensorData) => void;
  setConnected: (connected: boolean) => void;
  startBrewing: () => void;
  stopBrewing: () => void;
  setAlert: (alert: Alert | null) => void;
  recordDataPoint: () => void;
  clearRecordedData: () => void;
  setThresholds: (tempThreshold: number, pressureThreshold: number) => void;
  checkAlerts: (
    targetTemp: number,
    goalPressure: number,
    brewTimeTarget: number
  ) => Alert | null;
}

export const useMachineStore = create<MachineStateStore>((set, get) => ({
  sensorData: null,
  isConnected: false,
  isBrewing: false,
  brewingStartTime: null,
  currentAlert: null,
  recordedTemperatureData: [],
  recordedPressureData: [],
  recordedWeightData: [],
  temperatureAlertThreshold: 5,
  pressureAlertThreshold: 2,

  setSensorData: (data: SensorData) => {
    set({
      sensorData: data,
    });
  },

  setConnected: (connected: boolean) => {
    set({ isConnected: connected });
  },

  startBrewing: () => {
    set({
      isBrewing: true,
      brewingStartTime: Date.now(),
      recordedTemperatureData: [],
      recordedPressureData: [],
      recordedWeightData: [],
    });
  },

  stopBrewing: () => {
    set({
      isBrewing: false,
      brewingStartTime: null,
    });
  },

  setAlert: (alert: Alert | null) => {
    set({ currentAlert: alert });
  },

  recordDataPoint: () => {
    const state = get();
    const data = state.sensorData;

    if (!data || !state.isBrewing) return;

    const timestamp = Date.now();
    // Keep last 60 points to prevent performance issues
    const limit = (arr: DataPoint[]) => arr.slice(-60);

    set({
      recordedTemperatureData: limit([
        ...state.recordedTemperatureData,
        { time: timestamp, value: data.temperature },
      ]),
      recordedPressureData: limit([
        ...state.recordedPressureData,
        { time: timestamp, value: data.pressure },
      ]),
      recordedWeightData: limit([
        ...state.recordedWeightData,
        { time: timestamp, value: data.shotWeight },
      ]),
    });
  },

  clearRecordedData: () => {
    set({
      recordedTemperatureData: [],
      recordedPressureData: [],
      recordedWeightData: [],
    });
  },

  setThresholds: (tempThreshold: number, pressureThreshold: number) => {
    set({
      temperatureAlertThreshold: tempThreshold,
      pressureAlertThreshold: pressureThreshold,
    });
  },

  checkAlerts: (
    targetTemp: number,
    goalPressure: number,
    brewTimeTarget: number
  ): Alert | null => {
    const state = get();
    const data = state.sensorData;

    if (!data) return null;

    const now = Date.now();

    if (
      state.isBrewing &&
      data.temperature < targetTemp - state.temperatureAlertThreshold
    ) {
      return {
        id: `temp-${now}`,
        type: "temperature_drop",
        title: "Temperature Drop",
        message: `Temperature dropped to ${data.temperature}°C (target: ${targetTemp}°C)`,
        severity: "warning",
        timestamp: now,
      };
    }

    if (
      state.isBrewing &&
      data.pressure < goalPressure - state.pressureAlertThreshold
    ) {
      return {
        id: `pressure-${now}`,
        type: "pressure_drop",
        title: "Pressure Drop",
        message: `Pressure dropped to ${data.pressure} bar (goal: ${goalPressure} bar)`,
        severity: "warning",
        timestamp: now,
      };
    }

    if (
      state.isBrewing &&
      state.brewingStartTime &&
      state.sensorData &&
      state.sensorData.brewingTime >= brewTimeTarget
    ) {
      return {
        id: `brew-time-${now}`,
        type: "brew_complete",
        title: "Brewing Time Reached",
        message: `Target brewing time of ${brewTimeTarget}s reached`,
        severity: "info",
        timestamp: now,
      };
    }

    return null;
  },
}));
