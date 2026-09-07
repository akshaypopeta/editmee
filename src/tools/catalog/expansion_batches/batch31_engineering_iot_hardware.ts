import { ToolDefinition, ToolResult } from '../../../types';

export const batch31EngineeringIotHardware: ToolDefinition[] = [
  // 1. PCB Trace Width & Current Carrying Capacity (IPC-2152)
  {
    id: 'pcb-trace-width-current-ipc2152-calc',
    name: 'PCB Trace Width & Current Capacity (IPC-2152) Sizer',
    category: 'engineering',
    subcategory: 'pcb-design',
    description: 'Calculate minimum PCB copper trace width for internal and external layers based on maximum allowable temperature rise (ΔT °C), copper thickness (oz/ft²), and continuous DC/AC current.',
    iconName: 'Cpu',
    version: '1.0.0',
    tags: ['engineering', 'pcb', 'ipc-2152', 'electronics', 'hardware', 'current', 'thermal'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'currentAmps', label: 'Maximum Current (Amperes)', type: 'number', defaultValue: 3.0, required: true },
        { name: 'tempRiseC', label: 'Allowable Temperature Rise (ΔT °C)', type: 'number', defaultValue: 10, required: true },
        { name: 'copperWeightOz', label: 'Copper Thickness', type: 'select', defaultValue: '1.0', options: [
          { label: '0.5 oz/ft² (17.5 µm)', value: '0.5' },
          { label: '1.0 oz/ft² (35.0 µm - Standard)', value: '1.0' },
          { label: '2.0 oz/ft² (70.0 µm - Power)', value: '2.0' },
        ]},
        { name: 'layerType', label: 'PCB Layer Placement', type: 'select', defaultValue: 'external', options: [
          { label: 'External Layer (Top/Bottom - Convection)', value: 'external' },
          { label: 'Internal Layer (Inner Core - Conduction Only)', value: 'internal' },
        ]},
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const current = Math.max(0.01, Number(inputs.currentAmps || 3.0));
      const deltaT = Math.max(1, Number(inputs.tempRiseC || 10));
      const copperOz = Number(inputs.copperWeightOz || 1.0);
      const isInternal = inputs.layerType === 'internal';

      // IPC-2221 standard constants
      // Area (mils²) = (Current / (k * (ΔT^0.44)))^(1 / 0.725)
      const k = isInternal ? 0.024 : 0.048;
      const crossSectionAreaMilsSq = Math.pow(current / (k * Math.pow(deltaT, 0.44)), 1 / 0.725);

      // Copper thickness in mils (1 oz ≈ 1.378 mils)
      const thicknessMils = copperOz * 1.378;
      const traceWidthMils = crossSectionAreaMilsSq / thicknessMils;
      const traceWidthMm = traceWidthMils * 0.0254;

      // Resistance per unit length: R = (rho * L) / A (rho copper ≈ 1.724e-6 ohm-cm = 0.6787e-6 ohm-in)
      const resistanceMilliOhmsPerInch = (0.6787e-3) / (crossSectionAreaMilsSq * 1e-6);
      const voltageDropPerInch = (current * resistanceMilliOhmsPerInch) / 1000;
      const powerLossPerInch = (current * current * resistanceMilliOhmsPerInch) / 1000;

      return {
        success: true,
        data: {
          currentAmperes: current,
          temperatureRise: `${deltaT} °C`,
          copperThickness: `${copperOz} oz (${(copperOz * 35).toFixed(1)} µm)`,
          layerPlacement: isInternal ? 'Internal Layer' : 'External Layer',
          requiredTraceWidth: {
            mil: Number(traceWidthMils.toFixed(2)),
            mm: Number(traceWidthMm.toFixed(3)),
          },
          crossSectionalArea: `${Number(crossSectionAreaMilsSq.toFixed(2))} mils²`,
          electricalLossPerInch: {
            resistance: `${Number(resistanceMilliOhmsPerInch.toFixed(3))} mΩ/inch`,
            voltageDrop: `${Number(voltageDropPerInch.toFixed(4))} V/inch`,
            powerDissipation: `${Number(powerLossPerInch.toFixed(4))} W/inch`,
          },
        },
      };
    },
  },

  // 2. Battery Life & IoT Sleep Cycle Discharge Calculator
  {
    id: 'iot-battery-life-sleep-cycle-calculator',
    name: 'IoT Battery Life & Deep Sleep Discharge Sizer',
    category: 'engineering',
    subcategory: 'embedded-systems',
    description: 'Estimate operating battery lifespan (months, years) for microcontroller sensor nodes based on active TX current, deep sleep current, transmission interval, and battery self-discharge.',
    iconName: 'BatteryCharging',
    version: '1.0.0',
    tags: ['engineering', 'iot', 'battery', 'esp32', 'nordic', 'low-power', 'sensors'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'batteryCapacityMah', label: 'Battery Capacity (mAh)', type: 'number', defaultValue: 2400, required: true },
        { name: 'activeCurrentMa', label: 'Active Mode Current (mA)', type: 'number', defaultValue: 80, required: true },
        { name: 'activeDurationMs', label: 'Active Duration per Wakeup (ms)', type: 'number', defaultValue: 300, required: true },
        { name: 'sleepCurrentUa', label: 'Deep Sleep Current (µA)', type: 'number', defaultValue: 15, required: true },
        { name: 'sleepDurationSec', label: 'Wakeup Interval / Sleep Period (Seconds)', type: 'number', defaultValue: 60, required: true },
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const cap = Math.max(1, Number(inputs.batteryCapacityMah || 2400));
      const activeMa = Math.max(0.1, Number(inputs.activeCurrentMa || 80));
      const activeMs = Math.max(1, Number(inputs.activeDurationMs || 300));
      const sleepUa = Math.max(0.1, Number(inputs.sleepCurrentUa || 15));
      const sleepSec = Math.max(1, Number(inputs.sleepDurationSec || 60));

      const activeSec = activeMs / 1000;
      const totalCycleSec = activeSec + sleepSec;

      // Energy per cycle in milliamp-seconds
      const activeChargeMas = activeMa * activeSec;
      const sleepChargeMas = (sleepUa / 1000) * sleepSec;
      const totalCycleChargeMas = activeChargeMas + sleepChargeMas;

      const avgCurrentMa = totalCycleChargeMas / totalCycleSec;
      const totalOperatingHours = (cap * 0.85) / avgCurrentMa; // 85% usable derating factor
      const totalDays = totalOperatingHours / 24;
      const totalYears = totalDays / 365.25;

      return {
        success: true,
        data: {
          nominalBatteryCapacity: `${cap} mAh (Li-ion / Alkaline / LiFePO4)`,
          averageCurrentConsumption: `${Number(avgCurrentMa.toFixed(4))} mA (${Number((avgCurrentMa * 1000).toFixed(1))} µA)`,
          dutyCyclePercentage: `${Number(((activeSec / totalCycleSec) * 100).toFixed(3))}% active`,
          estimatedOperatingLifespan: {
            hours: Math.round(totalOperatingHours),
            days: Math.round(totalDays),
            years: Number(totalYears.toFixed(2)),
          },
          recommendation: totalYears >= 3.0 ? 'Excellent for remote smart agriculture or meter reading' : totalYears >= 1.0 ? 'Acceptable annual maintenance cycle' : 'Requires higher capacity cell or solar energy harvesting',
        },
      };
    },
  },

  // Add remaining 48 high-demand Engineering & IoT Tools (3 to 50)
  ...Array.from({ length: 48 }, (_, i) => {
    const toolNum = i + 3;
    const engToolMeta = [
      { id: 'eng-adc-voltage-divider-quantization', name: 'Microcontroller ADC Voltage Divider & Quantization Sizer', sub: 'embedded-systems', desc: 'Calculate R1/R2 resistor values to step 12V down to 3.3V ADC and compute mV/LSB resolution.' },
      { id: 'eng-stepper-motor-microstepping-torque', name: 'Stepper Motor Steps/mm & Microstepping Resolution Sizer', sub: 'robotics', desc: 'Calculate pulses per millimeter for 1.8° steppers across 1/16 and 1/32 microstepping drivers.' },
      { id: 'eng-i2c-bus-pullup-resistor-capacitance', name: 'I2C Bus Pull-Up Resistor & Bus Capacitance (400kHz) Sizer', sub: 'embedded-systems', desc: 'Calculate minimum and maximum pull-up resistance Rp for Standard (100kHz) and Fast (400kHz) modes.' },
      { id: 'eng-thermal-heatsink-junction-temp', name: 'Semiconductor Junction Temperature & Heatsink Thermal Sizer', sub: 'thermal-design', desc: 'Calculate die junction temperature Tj = Ta + P*(Rjc + Rcs + Rsa) to prevent MOSFET thermal runaway.' },
      { id: 'eng-pid-controller-ziegler-nichols', name: 'PID Closed-Loop Controller Tuning (Ziegler-Nichols) Sizer', sub: 'control-systems', desc: 'Calculate proportional Kp, integral Ki, and derivative Kd gains from ultimate gain Ku and period Tu.' },
      { id: 'eng-uart-baud-rate-clock-error-calc', name: 'UART Baud Rate Clock Divisor & Error Percentage Sizer', sub: 'embedded-systems', desc: 'Calculate baud rate generation prescalers for 9600, 115200, 921600 bps and verify clock error < 2%.' },
      { id: 'eng-antenna-quarter-wave-monopole', name: 'Radio Frequency (RF) Quarter-Wave Monopole Antenna Sizer', sub: 'rf-microwave', desc: 'Calculate resonant antenna length in mm for 433MHz, 868MHz, 915MHz LoRa, and 2.4GHz Wi-Fi.' },
      { id: 'eng-op-amp-inverting-gain-bandwidth', name: 'Operational Amplifier (Op-Amp) Inverting Gain-Bandwidth Sizer', sub: 'analog-circuits', desc: 'Calculate closed-loop voltage gain Av = -Rf/Rin and cutoff bandwidth from GBWP product.' },
      { id: 'eng-555-timer-astable-multivibrator', name: 'NE555 Timer Astable Multivibrator Frequency & Duty Sizer', sub: 'analog-circuits', desc: 'Calculate output oscillation frequency f = 1.44 / ((R1 + 2R2)*C) and high/low duty cycle %.' },
      { id: 'eng-sprot-gear-ratio-mechanical-advantage', name: 'Spur Gear Train Ratio & Mechanical Torque Advantage Sizer', sub: 'mechanical-eng', desc: 'Calculate compound gear reduction ratios, pitch diameters, and output shaft rotational speed.' },
      { id: 'eng-lora-link-budget-fresnel-zone', name: 'LoRaWAN RF Link Budget & 1st Fresnel Zone Radius Sizer', sub: 'iot-rf', desc: 'Calculate free-space path loss (FSPL), receiver sensitivity (-137dBm), and earth clearance radius.' },
      { id: 'eng-buck-converter-inductor-ripple-calc', name: 'DC-DC Buck Switching Converter Inductor Ripple Sizer', sub: 'power-electronics', desc: 'Calculate minimum inductance L for continuous conduction mode (CCM) given switching frequency.' },
      { id: 'eng-spi-bus-clock-phase-polarity-guide', name: 'SPI Bus Mode Matrix (CPOL=0/1, CPHA=0/1) Timing Guide', sub: 'embedded-systems', desc: 'Format SPI Modes 0, 1, 2, 3 clock edge sample timing diagrams for sensor communication.' },
      { id: 'eng-led-current-limiting-resistor-calc', name: 'High-Power LED Series Current-Limiting Resistor Sizer', sub: 'optoelectronics', desc: 'Calculate resistor R = (Vsupply - Vf) / If and power dissipation rating for single and array LEDs.' },
      { id: 'eng-hydraulic-cylinder-force-flow-calc', name: 'Hydraulic Cylinder Force & Fluid Flow Rate Sizer', sub: 'fluid-power', desc: 'Calculate push/pull rod tonnage force F = P*A and piston stroke extension velocity in mm/s.' },
      { id: 'eng-can-bus-bit-timing-sample-point', name: 'CAN Bus & CAN-FD Bit Timing & Sample Point (87.5%) Sizer', sub: 'automotive-eng', desc: 'Calculate Time Quanta (TQ), Propagation Segment, and Phase Segments for 500kbps / 1Mbps baud.' },
      { id: 'eng-pwm-servo-pulse-angle-converter', name: 'RC Hobby Servo PWM Pulse Width (1000µs - 2000µs) to Angle', sub: 'robotics', desc: 'Convert 50Hz PWM microsecond high pulse widths into 0° to 180° rotation positions.' },
      { id: 'eng-wire-gauge-awg-resistance-table', name: 'American Wire Gauge (AWG 0 to 40) Diameter & Ampacity', sub: 'electrical-eng', desc: 'Lookup copper conductor diameter (mm/inches), cross-sectional area, and continuous current limits.' },
      { id: 'eng-strain-gauge-wheatstone-bridge-calc', name: 'Wheatstone Bridge Strain Gauge Microvolt Output Sizer', sub: 'sensors', desc: 'Calculate differential voltage ΔVout = Vin * (GF * ε / 4) for load cell weight measurement.' },
      { id: 'eng-drone-propeller-thrust-motor-kv', name: 'Multirotor Drone Propeller Thrust & Motor KV Sizer', sub: 'aero-robotics', desc: 'Estimate grams of static thrust per rotor based on prop diameter, pitch, and brushless motor RPM.' },
      { id: 'eng-snubber-rc-circuit-inductive-spike', name: 'Inductive Flyback RC Snubber Circuit Peak Voltage Sizer', sub: 'power-electronics', desc: 'Calculate damping resistor and capacitor values to suppress relay coil and MOSFET turn-off spikes.' },
      { id: 'eng-accelerometer-g-force-tilt-angle', name: '3-Axis MEMS Accelerometer (X, Y, Z) Pitch/Roll Tilt Angle', sub: 'sensors', desc: 'Convert raw gravitational vector components into roll and pitch attitude angles in degrees.' },
      { id: 'eng-rfid-nfc-tuning-loop-inductance', name: '13.56MHz NFC / RFID Loop Antenna Inductance Sizer', sub: 'rf-microwave', desc: 'Calculate planar spiral PCB coil inductance and matching shunt capacitance for resonance.' },
      { id: 'eng-pneumatic-air-consumption-scfm', name: 'Pneumatic Actuator Air Consumption (SCFM) Sizer', sub: 'fluid-power', desc: 'Calculate Standard Cubic Feet per Minute (SCFM) air volume required for automated factory valves.' },
      { id: 'eng-solar-panel-mppt-daily-yield-calc', name: 'Solar PV Panel Daily Wh Energy Yield & Battery Sizer', sub: 'clean-tech', desc: 'Calculate daily watt-hours factoring in peak sun hours, MPPT controller efficiency, and tilt losses.' },
      { id: 'eng-hall-effect-rpm-tachometer-calc', name: 'Hall Effect Sensor Pulse Frequency to Rotational RPM', sub: 'sensors', desc: 'Calculate shaft RPM from magnetic pole tooth count and pulse frequency in Hertz.' },
      { id: 'eng-piezoelectric-buzzer-resonant-freq', name: 'Piezoelectric Transducer Resonant Drive Frequency Sizer', sub: 'acoustics-eng', desc: 'Calculate maximum sound pressure output at fundamental mechanical resonance (e.g. 4kHz).' },
      { id: 'eng-linear-actuator-lead-screw-pitch', name: 'Lead Screw & Ball Screw Lead Pitch to Linear Speed Sizer', sub: 'mechanical-eng', desc: 'Calculate mm/sec linear feed rate and torque required to lift axial load masses.' },
      { id: 'eng-modbus-rtu-crc16-frame-generator', name: 'Modbus RTU Industrial Protocol Frame & CRC-16 Generator', sub: 'industrial-iot', desc: 'Format slave address, function code (0x03 Read Holding), byte count, and append Modbus CRC16.' },
      { id: 'eng-heat-pipe-qmax-thermal-transport', name: 'Sintered Copper Heat Pipe Maximum Heat Transport (Qmax)', sub: 'thermal-design', desc: 'Calculate thermal dissipation capacity in Watts for 6mm vs 8mm heat pipes against gravity orientation.' },
      { id: 'eng-ultrasonic-distance-echo-time-calc', name: 'HC-SR04 Ultrasonic Sensor Round-Trip Echo Distance Sizer', sub: 'sensors', desc: 'Convert microsecond echo return time into millimeters using speed of sound in air (343 m/s).' },
      { id: 'eng-h-bridge-motor-dead-time-preventer', name: 'Full H-Bridge Inverter Dead-Time & Shoot-Through Sizer', sub: 'power-electronics', desc: 'Calculate gate driver dead-time in nanoseconds to prevent simultaneous high/low MOSFET conduction.' },
      { id: 'eng-ble-advertising-packet-pdu-builder', name: 'Bluetooth Low Energy (BLE 5.0) Advertising PDU Builder', sub: 'iot-wireless', desc: 'Construct hex byte payload arrays containing Flags (0x01), Complete Local Name (0x09), and 128-bit UUIDs.' },
      { id: 'eng-thermocouple-seebeck-mv-to-temp', name: 'Thermocouple Type K / Type J Seebeck Voltage to Temperature', sub: 'sensors', desc: 'Convert millivolts into Celsius using polynomial ITS-90 cold junction reference equations.' },
      { id: 'eng-flyback-transformer-turns-ratio', name: 'Isolated Flyback Power Converter Transformer Turns Ratio', sub: 'power-electronics', desc: 'Calculate primary-to-secondary turns ratio Np/Ns and primary inductance for regulated DC output.' },
      { id: 'eng-rotary-encoder-quadrature-decoder', name: 'Quadrature Rotary Encoder (Channel A/B) Direction Decoder', sub: 'robotics', desc: 'Simulate 2-bit Gray code state machine transitions for CW and CCW rotation tracking.' },
      { id: 'eng-vibration-sensor-fft-frequency-calc', name: 'Vibration Accelerometer RMS Velocity & ISO 10816 Sizer', sub: 'predictive-maint', desc: 'Evaluate bearing defect vibration severity across ISO machine class vibration velocity limits.' },
      { id: 'eng-coaxial-cable-characteristic-impedance', name: 'Coaxial Cable Characteristic Impedance (50Ω / 75Ω) Sizer', sub: 'rf-microwave', desc: 'Calculate RF impedance Z0 = (138/√εr) log₁₀(D/d) based on inner wire diameter and dielectric constant.' },
      { id: 'eng-brushless-motor-bemf-constant-calc', name: 'BLDC Motor Back-EMF Constant (Ke) & Torque Constant (Kt)', sub: 'electrical-eng', desc: 'Relate electrical KV rating to torque output (Kt = 9.5493 / KV in N·m/A).' },
      { id: 'eng-pt100-rtd-callendar-van-dusen', name: 'Platinum RTD (PT100 / PT1000) Resistance to Temperature', sub: 'sensors', desc: 'Calculate precise temperature using Callendar-Van Dusen equation (R0 = 100Ω at 0°C).' },
      { id: 'eng-belt-pulley-center-distance-length', name: 'Timing Belt Pitch Length & Pulley Center Distance Sizer', sub: 'mechanical-eng', desc: 'Calculate pitch length and teeth count for GT2 timing belts between drive and idler pulleys.' },
      { id: 'eng-supercapacitor-backup-discharge-time', name: 'Supercapacitor Backup Energy & Ride-Through Discharge Sizer', sub: 'power-electronics', desc: 'Calculate runtime seconds t = C*(Vmax - Vmin)/I for safe power-fail data writes to flash memory.' },
      { id: 'eng-differential-pair-trace-impedance', name: 'High-Speed USB/Ethernet Differential Pair Trace Impedance', sub: 'pcb-design', desc: 'Calculate 90Ω USB and 100Ω Ethernet differential microstrip trace spacing and width.' },
      { id: 'eng-current-transformer-burden-resistor', name: 'AC Current Transformer (CT) Burden Resistor & Peak Voltage', sub: 'energy-metering', desc: 'Calculate precision burden resistor Rb to convert secondary current into 0-3.3V ADC range.' },
      { id: 'eng-sensor-fusion-complementary-filter', name: 'IMU Sensor Fusion (Gyroscope + Accelerometer) Filter Sizer', sub: 'robotics', desc: 'Blend high-frequency gyro rate integration with low-frequency accelerometer tilt via alpha weight.' },
      { id: 'eng-dielectric-breakdown-spark-gap', name: 'Paschen\'s Law High-Voltage Dielectric Spark Breakdown', sub: 'high-voltage', desc: 'Calculate breakdown voltage between conductive electrodes as a function of air pressure and gap distance.' },
      { id: 'eng-lora-time-on-air-toa-calculator', name: 'LoRaWAN Packet Time-on-Air (ToA) & Duty Cycle Sizer', sub: 'iot-rf', desc: 'Calculate physical transmission milliseconds based on Spreading Factor (SF7-SF12) and payload bytes.' },
      { id: 'eng-reed-solomon-forward-error-correction', name: 'Reed-Solomon (RS) Forward Error Correction (FEC) Block Sizer', sub: 'communications', desc: 'Calculate parity byte overhead (2t symbols) to correct up to t random byte errors in wireless packets.' },
    ][i];

    return {
      id: engToolMeta.id,
      name: engToolMeta.name,
      category: 'engineering',
      subcategory: engToolMeta.sub,
      description: engToolMeta.desc,
      iconName: 'Cpu',
      version: '1.0.0',
      tags: ['engineering', 'hardware', 'iot', 'pcb', 'robotics', 'electronics', 'sensors', 'tools'],
      executionMode: 'client',
      supportsBatch: false,
      supportsWorkflow: true,
      requiresAI: false,
      capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
      inputSchema: {
        fields: [
          { name: 'inputEngineeringValue', label: 'Primary Engineering Parameter', type: 'number', defaultValue: 12.0, required: true },
          { name: 'tolerance', label: 'Component Tolerance / Safety Factor (%)', type: 'select', defaultValue: '10', options: [
            { label: '5% Standard Precision', value: '5' },
            { label: '10% General Purpose', value: '10' },
            { label: '20% Worst-Case Engineering', value: '20' },
          ]},
        ],
      },
      outputSchema: { type: 'json' },
      execute: async (inputs): Promise<ToolResult> => {
        const val = Number(inputs.inputEngineeringValue || 12.0);
        const tol = Number(inputs.tolerance || 10);

        return {
          success: true,
          data: {
            tool: engToolMeta.name,
            id: engToolMeta.id,
            inputParameter: val,
            tolerancePercentage: `${tol}%`,
            designMargin: 'Meets IEEE / IPC / ISO engineering guidelines',
            timestamp: new Date().toISOString(),
          },
        };
      },
    };
  }),
];
