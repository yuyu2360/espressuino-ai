import type { SensorData, MachineMode } from '../types';

export class MockWebSocketServer {
  private sensorData: SensorData;
  private isBrewing: boolean = false;
  private preInfusionActive: boolean = false;
  private targetTemperature: number = 92;
  private targetPressure: number = 9;
  private preInfusionTime: number = 0;
  private brewingStartTime: number = 0;
  private shotWeight: number = 0;
  private machineOn: boolean = false;
  private machineMode: MachineMode = 'coffee';
  private temperature: number = 25;
  private pressure: number = 0;
  private heatingRate: number = 2;
  private coolingRate: number = 0.5;
  private brewStartWeight: number = 0;

  constructor() {
    this.sensorData = {
      temperature: 25,
      pressure: 0,
      shotWeight: 0,
      brewingTime: 0,
      machineStatus: 'off',
      machineMode: 'coffee',
      isHeating: false,
      timestamp: Date.now(),
    };
  }

  private updateSensorData(): void {
    if (this.machineOn && !this.isBrewing) {
      if (this.temperature < this.targetTemperature) {
        this.temperature = Math.min(this.temperature + this.heatingRate, this.targetTemperature);
        this.sensorData.isHeating = true;
      } else {
        this.sensorData.isHeating = false;
      }
      this.sensorData.machineStatus = this.sensorData.isHeating ? 'heating' : 'standby';
    }

    if (this.isBrewing) {
      const brewDuration = Date.now() - this.brewingStartTime;
      this.sensorData.brewingTime = Math.floor(brewDuration / 1000);

      if (this.preInfusionActive) {
        if (this.preInfusionTime > 0 && brewDuration >= this.preInfusionTime * 1000) {
          this.preInfusionActive = false;
        }
      }

      if (!this.preInfusionActive) {
        this.pressure = Math.min(this.pressure + 0.3, this.targetPressure);
        this.shotWeight = this.brewStartWeight + (this.sensorData.brewingTime * 0.8);
      }

      this.sensorData.machineStatus = 'brewing';

      if (this.temperature > this.targetTemperature - 5) {
        this.temperature = Math.max(this.temperature - this.coolingRate, this.targetTemperature - 3);
      }
    } else {
      this.shotWeight = 0;
      this.pressure = 0;
    }

    if (!this.machineOn && this.temperature > 25) {
      this.temperature = Math.max(this.temperature - this.coolingRate * 2, 25);
      this.sensorData.machineStatus = 'off';
      this.sensorData.isHeating = false;
    }

    this.sensorData.temperature = Math.round(this.temperature * 10) / 10;
    this.sensorData.pressure = Math.round(this.pressure * 10) / 10;
    this.sensorData.shotWeight = Math.round(this.shotWeight * 10) / 10;
    this.sensorData.machineMode = this.machineMode;
    this.sensorData.timestamp = Date.now();
  }

  processCommand(command: any): void {
    switch (command.type) {
      case 'machine_on':
        this.machineOn = true;
        break;
      case 'machine_off':
        this.machineOn = false;
        this.isBrewing = false;
        this.preInfusionActive = false;
        break;
      case 'mode_switch':
        this.machineMode = command.value === 'coffee' ? 'coffee' : 'steam';
        break;
      case 'start_brew':
        if (this.machineOn) {
          this.isBrewing = true;
          this.brewingStartTime = Date.now();
          this.preInfusionActive = true;
          this.shotWeight = 0;
          this.pressure = 0;
          this.brewStartWeight = Math.random() * 20 + 18;
        }
        break;
      case 'stop_brew':
        this.isBrewing = false;
        this.preInfusionActive = false;
        break;
      case 'temperature':
        this.targetTemperature = Math.max(80, Math.min(105, command.value));
        break;
      case 'pressure':
        this.targetPressure = Math.max(0, Math.min(15, command.value));
        break;
      case 'pre_infusion':
        this.preInfusionTime = Math.max(0, Math.min(10, command.value));
        break;
    }
  }

  getSensorData(): SensorData {
    this.updateSensorData();
    return { ...this.sensorData };
  }

  getMachineState() {
    return {
      temperature: this.temperature,
      pressure: this.pressure,
      shotWeight: this.shotWeight,
      machineOn: this.machineOn,
      isBrewing: this.isBrewing,
      machineMode: this.machineMode,
      preInfusionActive: this.preInfusionActive,
    };
  }

  simulateTemperatureDrop(): void {
    this.temperature = Math.max(this.targetTemperature - 10, this.temperature - 15);
  }

  simulatePressureDrop(): void {
    this.pressure = Math.max(0, this.pressure - 3);
  }

  reset(): void {
    this.machineOn = false;
    this.isBrewing = false;
    this.preInfusionActive = false;
    this.temperature = 25;
    this.pressure = 0;
    this.shotWeight = 0;
    this.brewingStartTime = 0;
  }
}

let mockServer: MockWebSocketServer | null = null;

export function getMockWebSocketServer(): MockWebSocketServer {
  if (!mockServer) {
    mockServer = new MockWebSocketServer();
  }
  return mockServer;
}

export function resetMockServer(): void {
  mockServer = null;
}
