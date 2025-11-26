export type AccountType = 'user' | 'guest';
export type Theme = 'light' | 'dark';
export type BrewTimeDisplayMode = 'countdown' | 'count-up';
export type MachineMode = 'coffee' | 'steam' | 'off';
export type MachineStatus = 'off' | 'standby' | 'heating' | 'brewing' | 'steam';

export interface SensorData {
  temperature: number;
  pressure: number;
  shotWeight: number;
  brewingTime: number;
  machineStatus: MachineStatus;
  machineMode: MachineMode;
  isHeating: boolean;
  timestamp: number;
}

export interface DataPoint {
  time: number;
  value: number;
}

export interface Profile {
  id: string;
  email: string;
  accountType: AccountType;
  userId?: string;
  createdAt: string;
}

export interface BrewingProfile {
  id: string;
  profileId: string;
  name: string;
  targetTemperature: number;
  goalPressure: number;
  preInfusionTime: number;
  brewingTimeTarget: number;
  coffeeInputAmount: number;
  targetOutputAmount: number;
  isDefault: boolean;
  createdAt: string;
}

export interface ShotHistory {
  id: string;
  profileId: string;
  brewingProfileId?: string;
  coffeeInputAmount: number;
  targetOutputAmount: number;
  actualOutputWeight?: number;
  duration: number;
  avgTemperature?: number;
  avgPressure?: number;
  maxTemperature?: number;
  minTemperature?: number;
  temperatureData: DataPoint[];
  pressureData: DataPoint[];
  weightData: DataPoint[];
  createdAt: string;
}

export interface UserSettings {
  id: string;
  profileId: string;
  theme: Theme;
  brewTimeDisplayMode: BrewTimeDisplayMode;
  alertSoundEnabled: boolean;
  alertHapticsEnabled: boolean;
  temperatureAlertThreshold: number;
  pressureAlertThreshold: number;
  machineName: string;
  websocketServerUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Command {
  type: 'machine_on' | 'machine_off' | 'mode_switch' | 'start_brew' | 'stop_brew' | 'temperature' | 'pressure' | 'pre_infusion';
  value?: number | string;
  timestamp: number;
}

export interface Alert {
  id: string;
  type: 'temperature_drop' | 'pressure_drop' | 'brew_complete' | 'weight_target_reached';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  profile?: Profile;
  settings?: UserSettings;
  currentBrewingProfile?: BrewingProfile;
}

export interface MachineState {
  sensorData: SensorData;
  isConnected: boolean;
  currentAlert?: Alert;
  brewingHistory: DataPoint[];
  isBrewing: boolean;
  recordedTemperatureData: DataPoint[];
  recordedPressureData: DataPoint[];
  recordedWeightData: DataPoint[];
}
