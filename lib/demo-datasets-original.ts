// Demo datasets for ThrustBench with realistic propulsion test data

export interface DemoDataset {
  id: string
  name: string
  type: string
  description: string
  burnTime: string
  maxThrust: string
  isp: string
  characteristics: string[]
  csvData: () => string
}

// Helper function to generate realistic sensor noise
function addNoise(value: number, noisePercent: number = 0.5): number {
  const noise = (Math.random() - 0.5) * 2 * (value * noisePercent / 100)
  return Math.round((value + noise) * 1000) / 1000
}

// Helper to generate pressure transients
function pressureTransient(baseValue: number, time: number, transientTime: number): number {
  if (time < transientTime) {
    const rampFactor = Math.min(1, time / transientTime)
    const oscillation = Math.sin(time * 50) * 0.05 * (1 - rampFactor)
    return baseValue * rampFactor * (1 + oscillation)
  }
  return baseValue
}

export const demoDatasets: DemoDataset[] = [
  {
    id: 'liquid-rocket',
    name: 'Liquid Rocket Engine Test',
    type: 'Bipropellant Liquid Engine',
    description: 'LOX/Kerosene engine with turbopump feed system showing ignition transients, steady-state operation, and controlled shutdown',
    burnTime: '8.5 seconds',
    maxThrust: '2,850 N',
    isp: '335 seconds',
    characteristics: ['Turbopump fed', 'Regenerative cooling', 'Ignition transients', 'Combustion instability'],
    csvData: () => {
      const header = 'time,thrust,chamber_pressure,nozzle_exit_pressure,injector_pressure,chamber_temp_1,chamber_temp_2,nozzle_throat_temp,oxidizer_flow,fuel_flow,turbopump_rpm,vibration_x,vibration_y,igniter_current,valve_position_ox\n'
      let data = ''
      
      for (let i = 0; i <= 850; i++) { // 8.5 seconds at 100Hz
        const t = i / 100
        
        // Ignition phase (0-0.5s)
        let thrustProfile = 0
        let chamberPressure = 14.7 // Start at atmospheric
        let nozzleExitPressure = 14.7
        let injectorPressure = 50
        
        if (t >= 0.1 && t < 0.5) {
          // Ignition transient
          const ignitionProgress = (t - 0.1) / 0.4
          thrustProfile = 2850 * Math.pow(ignitionProgress, 1.5) * (1 + Math.sin(t * 20) * 0.1)
          chamberPressure = pressureTransient(280, t - 0.1, 0.4) + 14.7
          nozzleExitPressure = 14.7 + (chamberPressure - 14.7) * 0.15
          injectorPressure = 350 + (chamberPressure - 14.7) * 1.5
        } else if (t >= 0.5 && t < 7.8) {
          // Steady state with slight variations
          const variation = 1 + Math.sin(t * 2) * 0.02 + Math.sin(t * 8) * 0.01
          thrustProfile = 2850 * variation
          chamberPressure = 280 * variation + 14.7
          nozzleExitPressure = 14.7 + (chamberPressure - 14.7) * 0.15
          injectorPressure = 350 + (chamberPressure - 14.7) * 1.5
        } else if (t >= 7.8) {
          // Shutdown phase
          const shutdownProgress = Math.max(0, 1 - (t - 7.8) / 0.7)
          thrustProfile = 2850 * shutdownProgress * shutdownProgress
          chamberPressure = (280 * shutdownProgress + 14.7)
          nozzleExitPressure = 14.7 + (chamberPressure - 14.7) * 0.15
          injectorPressure = 50 + (300 * shutdownProgress)
        }
        
        // Temperatures
        const chamberTemp1 = t > 0.1 ? 1200 + (t - 0.1) * 50 + Math.sin(t * 3) * 20 : 293
        const chamberTemp2 = t > 0.1 ? 1150 + (t - 0.1) * 45 + Math.sin(t * 2.5) * 25 : 293
        const nozzleThroatTemp = t > 0.1 ? 1800 + (t - 0.1) * 30 + Math.sin(t * 4) * 30 : 293
        
        // Flow rates
        const oxidizerFlow = t >= 0.1 && t < 7.8 ? 2.8 + Math.sin(t * 1.5) * 0.1 : 0
        const fuelFlow = t >= 0.1 && t < 7.8 ? 1.1 + Math.sin(t * 1.8) * 0.05 : 0
        
        // Turbopump RPM
        const turbopumpRPM = t >= 0.1 && t < 7.8 ? 18000 + Math.sin(t * 2) * 500 : 0
        
        // Vibration data
        const vibrationX = t >= 0.1 ? Math.sin(t * 100) * 2.5 + Math.random() * 0.5 : 0.1
        const vibrationY = t >= 0.1 ? Math.sin(t * 120 + Math.PI/3) * 3.0 + Math.random() * 0.6 : 0.1
        
        // Igniter current
        const igniterCurrent = t >= 0.05 && t < 0.5 ? 15 + Math.sin(t * 30) * 2 : 0
        
        // Valve position
        const valvePosition = t >= 0.08 && t < 7.9 ? 95 + Math.sin(t * 0.5) * 1 : 0
        
        // Add realistic noise to all values
        const row = [
          t.toFixed(2),
          addNoise(thrustProfile, 0.3).toFixed(1),
          addNoise(chamberPressure, 0.5).toFixed(1),
          addNoise(nozzleExitPressure, 1.0).toFixed(1),
          addNoise(injectorPressure, 0.4).toFixed(1),
          addNoise(chamberTemp1, 0.8).toFixed(0),
          addNoise(chamberTemp2, 0.8).toFixed(0),
          addNoise(nozzleThroatTemp, 1.2).toFixed(0),
          addNoise(oxidizerFlow, 1.5).toFixed(2),
          addNoise(fuelFlow, 1.5).toFixed(2),
          addNoise(turbopumpRPM, 2.0).toFixed(0),
          addNoise(vibrationX, 5.0).toFixed(2),
          addNoise(vibrationY, 5.0).toFixed(2),
          addNoise(igniterCurrent, 3.0).toFixed(1),
          addNoise(valvePosition, 0.2).toFixed(1)
        ].join(',')
        
        data += row + '\n'
      }
      
      return header + data
    }
  },
  
  {
    id: 'solid-motor',
    name: 'Solid Motor Test',
    type: 'Composite Propellant Grain',
    description: 'APCP solid motor with star-grain configuration showing characteristic pressure and thrust curves with grain burnback',
    burnTime: '12.3 seconds',
    maxThrust: '4,200 N',
    isp: '242 seconds',
    characteristics: ['APCP propellant', 'Star grain', 'Throat erosion', 'Pressure oscillations'],
    csvData: () => {
      const header = 'time,thrust,chamber_pressure,nozzle_temp,case_temp_1,case_temp_2,case_temp_3,ambient_temp,throat_diameter,mass_remaining,pressure_osc_1,pressure_osc_2,strain_gauge_1,strain_gauge_2\n'
      let data = ''
      
      for (let i = 0; i <= 1230; i++) { // 12.3 seconds at 100Hz
        const t = i / 100
        
        // Solid motor burn profile - starts high, decreases as grain burns
        let thrustProfile = 0
        let chamberPressure = 14.7
        let throatDiameter = 15.2 // mm, grows due to erosion
        let massRemaining = 8.5 // kg initial propellant
        
        if (t >= 0.05 && t < 12.0) {
          // Burn time calculation
          const burnProgress = (t - 0.05) / 11.95
          
          // Star grain burn - high initial surface area, then decreases
          const surfaceAreaFactor = Math.max(0.3, 1 - burnProgress * 0.7)
          const pressureExponent = 0.35 // typical for APCP
          
          thrustProfile = 4200 * Math.pow(surfaceAreaFactor, pressureExponent)
          chamberPressure = 85 * Math.pow(surfaceAreaFactor, pressureExponent) + 14.7
          
          // Add pressure oscillations (combustion instability)
          const oscillation = Math.sin(t * 150) * 0.03 + Math.sin(t * 80) * 0.02
          thrustProfile *= (1 + oscillation)
          chamberPressure *= (1 + oscillation)
          
          // Throat erosion
          throatDiameter = 15.2 + burnProgress * 0.8
          
          // Mass consumption
          massRemaining = 8.5 * (1 - burnProgress)
          
          // Tail-off at end
          if (burnProgress > 0.95) {
            const tailOff = Math.max(0, 1 - (burnProgress - 0.95) / 0.05)
            thrustProfile *= tailOff * tailOff
            chamberPressure = 14.7 + (chamberPressure - 14.7) * tailOff
          }
        }
        
        // Temperatures
        const nozzleTemp = t > 0.05 ? Math.min(2200, 800 + t * 120 + Math.sin(t * 5) * 40) : 293
        const caseTemp1 = t > 0.05 ? Math.min(400, 293 + t * 8 + Math.sin(t * 0.5) * 5) : 293
        const caseTemp2 = t > 0.05 ? Math.min(380, 293 + t * 7.5 + Math.sin(t * 0.6) * 6) : 293
        const caseTemp3 = t > 0.05 ? Math.min(360, 293 + t * 7 + Math.sin(t * 0.7) * 4) : 293
        const ambientTemp = 295 + Math.sin(t * 0.1) * 2
        
        // Pressure oscillations at different frequencies
        const pressureOsc1 = t > 0.05 ? Math.sin(t * 120) * (chamberPressure - 14.7) * 0.02 : 0
        const pressureOsc2 = t > 0.05 ? Math.sin(t * 200 + Math.PI/4) * (chamberPressure - 14.7) * 0.015 : 0
        
        // Strain gauges on case
        const strainGauge1 = t > 0.05 ? (chamberPressure - 14.7) * 2.5 + Math.sin(t * 15) * 5 : 0
        const strainGauge2 = t > 0.05 ? (chamberPressure - 14.7) * 2.8 + Math.sin(t * 18) * 6 : 0
        
        const row = [
          t.toFixed(2),
          addNoise(thrustProfile, 0.4).toFixed(1),
          addNoise(chamberPressure, 0.6).toFixed(1),
          addNoise(nozzleTemp, 1.0).toFixed(0),
          addNoise(caseTemp1, 0.5).toFixed(1),
          addNoise(caseTemp2, 0.5).toFixed(1),
          addNoise(caseTemp3, 0.5).toFixed(1),
          addNoise(ambientTemp, 0.2).toFixed(1),
          addNoise(throatDiameter, 0.1).toFixed(3),
          addNoise(massRemaining, 0.3).toFixed(3),
          addNoise(pressureOsc1, 10.0).toFixed(2),
          addNoise(pressureOsc2, 10.0).toFixed(2),
          addNoise(strainGauge1, 2.0).toFixed(1),
          addNoise(strainGauge2, 2.0).toFixed(1)
        ].join(',')
        
        data += row + '\n'
      }
      
      return header + data
    }
  },
  
  {
    id: 'cold-gas',
    name: 'Cold Gas Thruster',
    type: 'Pulsed Nitrogen RCS',
    description: 'Reaction control system thruster with rapid pulse firing for spacecraft attitude control showing valve response dynamics',
    burnTime: '15.0 seconds',
    maxThrust: '22 N',
    isp: '65 seconds',
    characteristics: ['Pulsed operation', 'Fast valve response', 'Pressure regulation', 'Attitude control'],
    csvData: () => {
      const header = 'time,thrust,chamber_pressure,supply_pressure,valve_position,valve_current,nozzle_temp,supply_temp,flow_rate,accumulated_impulse,pressure_reg_error,valve_response_time\n'
      let data = ''
      
      // Define pulse sequence - various pulse widths and intervals
      const pulseSequence = [
        { start: 1.0, duration: 0.1 },   // 100ms pulse
        { start: 2.5, duration: 0.05 },  // 50ms pulse
        { start: 3.2, duration: 0.2 },   // 200ms pulse
        { start: 4.8, duration: 0.08 },  // 80ms pulse
        { start: 5.5, duration: 0.15 },  // 150ms pulse
        { start: 7.0, duration: 0.03 },  // 30ms pulse
        { start: 8.1, duration: 0.25 },  // 250ms pulse
        { start: 10.5, duration: 0.06 }, // 60ms pulse
        { start: 11.8, duration: 0.18 }, // 180ms pulse
        { start: 13.2, duration: 0.12 }, // 120ms pulse
      ]
      
      let accumulatedImpulse = 0
      
      for (let i = 0; i <= 1500; i++) { // 15 seconds at 100Hz
        const t = i / 100
        
        // Check if we're in a pulse
        let inPulse = false
        let pulseProgress = 0
        for (const pulse of pulseSequence) {
          if (t >= pulse.start && t < pulse.start + pulse.duration) {
            inPulse = true
            pulseProgress = (t - pulse.start) / pulse.duration
            break
          }
        }
        
        // Valve dynamics - not instantaneous
        let valvePosition = 0
        let valveCurrent = 0
        let chamberPressure = 14.7
        let thrust = 0
        let flowRate = 0
        const valveResponseTime = 0.008 // 8ms response time
        
        if (inPulse) {
          // Valve opening dynamics
          if (pulseProgress < valveResponseTime / 0.1) {
            const openProgress = pulseProgress / (valveResponseTime / 0.1)
            valvePosition = Math.min(100, openProgress * 100)
          } else {
            valvePosition = 100
          }
          valveCurrent = 2.5
        } else {
          // Check if we just ended a pulse (closing dynamics)
          let justEnded = false
          for (const pulse of pulseSequence) {
            if (t >= pulse.start + pulse.duration && t < pulse.start + pulse.duration + valveResponseTime) {
              justEnded = true
              const closeProgress = (t - pulse.start - pulse.duration) / valveResponseTime
              valvePosition = Math.max(0, 100 * (1 - closeProgress))
              break
            }
          }
          valveCurrent = justEnded ? 0.5 : 0
        }
        
        // Thrust and pressure based on valve position
        if (valvePosition > 0) {
          const flowFactor = valvePosition / 100
          thrust = 22 * flowFactor * flowFactor // Quadratic flow relationship
          chamberPressure = 14.7 + (25 - 14.7) * flowFactor
          flowRate = 0.045 * flowFactor // kg/s
          
          // Add some thrust ripple due to pressure regulation
          thrust *= (1 + Math.sin(t * 200) * 0.05)
        }
        
        // Supply pressure with regulation
        const supplyPressure = 250 + Math.sin(t * 0.5) * 2 - (flowRate * 10)
        const pressureRegError = Math.abs(250 - supplyPressure)
        
        // Temperatures
        const nozzleTemp = inPulse ? 180 + Math.sin(t * 20) * 10 : 293 + (180 - 293) * Math.exp(-(t % 1) * 5)
        const supplyTemp = 288 + Math.sin(t * 0.1) * 3
        
        // Accumulate impulse
        if (thrust > 0) {
          accumulatedImpulse += thrust * 0.01 // dt = 0.01s
        }
        
        const row = [
          t.toFixed(2),
          addNoise(thrust, 1.0).toFixed(2),
          addNoise(chamberPressure, 0.8).toFixed(1),
          addNoise(supplyPressure, 0.3).toFixed(1),
          addNoise(valvePosition, 0.5).toFixed(1),
          addNoise(valveCurrent, 2.0).toFixed(2),
          addNoise(nozzleTemp, 1.0).toFixed(1),
          addNoise(supplyTemp, 0.3).toFixed(1),
          addNoise(flowRate * 1000, 2.0).toFixed(2), // Convert to g/s
          addNoise(accumulatedImpulse, 0.5).toFixed(2),
          addNoise(pressureRegError, 5.0).toFixed(2),
          (valveResponseTime * 1000).toFixed(1) // Convert to ms
        ].join(',')
        
        data += row + '\n'
      }
      
      return header + data
    }
  },
  
  {
    id: 'ion-thruster',
    name: 'Ion Propulsion Test',
    type: 'Hall Effect Thruster',
    description: 'Xenon Hall effect thruster showing high specific impulse, low thrust operation with plasma characteristics and power consumption',
    burnTime: '300 seconds',
    maxThrust: '0.092 N',
    isp: '1,640 seconds',
    characteristics: ['High ISP', 'Xenon propellant', 'Plasma discharge', 'Power efficient'],
    csvData: () => {
      const header = 'time,thrust,mass_flow_rate,discharge_voltage,discharge_current,anode_voltage,cathode_current,xenon_flow,plasma_temp,ion_beam_current,power_consumption,specific_impulse,efficiency\n'
      let data = ''
      
      for (let i = 0; i <= 3000; i += 10) { // 300 seconds at 10Hz (reduce data density)
        const t = i / 10
        
        // Startup sequence
        let thrustProfile = 0
        let dischargeVoltage = 0
        let dischargeCurrent = 0
        let anodeVoltage = 0
        let cathodeCurrent = 0
        let xenonFlow = 0
        let plasmaTemp = 300
        
        if (t < 5) {
          // Startup phase
          const startupProgress = t / 5
          thrustProfile = 0.092 * startupProgress * startupProgress
          dischargeVoltage = 300 * startupProgress
          dischargeCurrent = 4.5 * startupProgress
          anodeVoltage = 300 * startupProgress
          cathodeCurrent = 2.8 * startupProgress
          xenonFlow = 5.2e-6 * startupProgress // kg/s
          plasmaTemp = 300 + (15000 - 300) * startupProgress
        } else if (t >= 5 && t < 295) {
          // Steady state operation with minor variations
          const variation = 1 + Math.sin(t * 0.05) * 0.02 + Math.sin(t * 0.2) * 0.01
          thrustProfile = 0.092 * variation
          dischargeVoltage = 300 + Math.sin(t * 0.1) * 5
          dischargeCurrent = 4.5 + Math.sin(t * 0.15) * 0.2
          anodeVoltage = 300 + Math.sin(t * 0.08) * 8
          cathodeCurrent = 2.8 + Math.sin(t * 0.12) * 0.15
          xenonFlow = 5.2e-6 * variation
          plasmaTemp = 15000 + Math.sin(t * 0.3) * 500
        } else {
          // Shutdown phase
          const shutdownProgress = Math.max(0, 1 - (t - 295) / 5)
          thrustProfile = 0.092 * shutdownProgress
          dischargeVoltage = 300 * shutdownProgress
          dischargeCurrent = 4.5 * shutdownProgress
          anodeVoltage = 300 * shutdownProgress
          cathodeCurrent = 2.8 * shutdownProgress
          xenonFlow = 5.2e-6 * shutdownProgress
          plasmaTemp = 300 + (15000 - 300) * shutdownProgress
        }
        
        // Derived parameters
        const ionBeamCurrent = dischargeCurrent * 0.7 // About 70% of discharge current becomes ion beam
        const powerConsumption = dischargeVoltage * dischargeCurrent + anodeVoltage * 0.5 + cathodeCurrent * 20
        const specificImpulse = xenonFlow > 0 ? thrustProfile / (xenonFlow * 9.81) : 0
        const efficiency = powerConsumption > 0 ? (thrustProfile * thrustProfile / (2 * powerConsumption * xenonFlow)) * 100 : 0
        
        // Add plasma instabilities and noise
        const plasmaInstability = Math.sin(t * 10 + Math.sin(t * 3)) * 0.03
        const thermalNoise = (Math.random() - 0.5) * 0.01
        
        const row = [
          t.toFixed(1),
          addNoise(thrustProfile * (1 + plasmaInstability), 0.5).toFixed(6),
          addNoise(xenonFlow * 1e6, 1.0).toFixed(3), // Convert to mg/s
          addNoise(dischargeVoltage, 0.3).toFixed(1),
          addNoise(dischargeCurrent, 0.8).toFixed(2),
          addNoise(anodeVoltage, 0.4).toFixed(1),
          addNoise(cathodeCurrent, 1.0).toFixed(2),
          addNoise(xenonFlow * 1e6, 1.0).toFixed(3), // mg/s
          addNoise(plasmaTemp, 2.0).toFixed(0),
          addNoise(ionBeamCurrent, 1.5).toFixed(2),
          addNoise(powerConsumption, 0.5).toFixed(1),
          addNoise(specificImpulse, 0.8).toFixed(0),
          addNoise(efficiency, 1.2).toFixed(2)
        ].join(',')
        
        data += row + '\n'
      }
      
      return header + data
    }
  },
  
  {
    id: 'hybrid-rocket',
    name: 'Hybrid Rocket Motor',
    type: 'HTPB/N2O Hybrid',
    description: 'Hydroxyl-terminated polybutadiene fuel grain with nitrous oxide oxidizer showing complex combustion dynamics and flow instabilities',
    burnTime: '18.5 seconds',
    maxThrust: '1,250 N',
    isp: '285 seconds',
    characteristics: ['Hybrid combustion', 'O/F ratio variation', 'Combustion instability', 'Oxidizer injection'],
    csvData: () => {
      const header = 'time,thrust,chamber_pressure,oxidizer_pressure,fuel_regression_rate,oxidizer_flow,combustion_efficiency,mixture_ratio,injector_temp,chamber_temp,nozzle_temp,pressure_oscillation,oxidizer_density\n'
      let data = ''
      
      for (let i = 0; i <= 1850; i++) { // 18.5 seconds at 100Hz
        const t = i / 100
        
        // Hybrid motor burn profile
        let thrustProfile = 0
        let chamberPressure = 14.7
        let oxidizerPressure = 50
        let oxidizerFlow = 0
        let fuelRegressionRate = 0
        let combustionEfficiency = 0
        let mixRatio = 0
        
        if (t >= 0.2 && t < 18.0) {
          const burnTime = t - 0.2
          const totalBurnTime = 17.8
          const burnProgress = burnTime / totalBurnTime
          
          // Oxidizer flow ramp-up and steady state
          if (burnTime < 0.5) {
            // Ramp up
            oxidizerFlow = (burnTime / 0.5) * 1.8
          } else if (burnTime < totalBurnTime - 1.0) {
            // Steady state with variations
            oxidizerFlow = 1.8 + Math.sin(burnTime * 0.5) * 0.1
          } else {
            // Tail off
            const tailOffProgress = (burnTime - (totalBurnTime - 1.0)) / 1.0
            oxidizerFlow = 1.8 * (1 - tailOffProgress)
          }
          
          // Fuel regression rate - decreases as port diameter increases
          const portGrowthFactor = 1 + burnProgress * 0.4 // Port grows 40% over burn
          fuelRegressionRate = 0.08 / Math.sqrt(portGrowthFactor) // mm/s
          
          // Fuel mass flow rate
          const fuelFlow = fuelRegressionRate * (1 - burnProgress * 0.1) // Decreases as surface area changes
          
          // Mixture ratio O/F
          mixRatio = fuelFlow > 0 ? oxidizerFlow / fuelFlow : 0
          
          // Combustion efficiency - affected by mixture ratio
          const optimalMixRatio = 6.5
          const mixRatioDeviation = Math.abs(mixRatio - optimalMixRatio) / optimalMixRatio
          combustionEfficiency = Math.max(0.7, 0.95 - mixRatioDeviation * 0.2)
          
          // Chamber pressure and thrust
          const combustionRate = oxidizerFlow * fuelFlow * combustionEfficiency
          chamberPressure = 14.7 + combustionRate * 45
          thrustProfile = 1250 * combustionEfficiency * (oxidizerFlow / 1.8)
          
          // Pressure oscillations due to combustion instability
          const instabilityFreq1 = 25 // Hz - longitudinal mode
          const instabilityFreq2 = 80 // Hz - transverse mode
          const instabilityAmp = 0.05 + burnProgress * 0.03 // Increases with burn time
          
          const oscillation = Math.sin(2 * Math.PI * instabilityFreq1 * t) * instabilityAmp +
                            Math.sin(2 * Math.PI * instabilityFreq2 * t) * instabilityAmp * 0.5
          
          thrustProfile *= (1 + oscillation)
          chamberPressure *= (1 + oscillation)
          
          oxidizerPressure = 600 - oxidizerFlow * 50 // Pressure drop in feed system
        }
        
        // Temperatures
        const injectorTemp = t > 0.2 ? Math.min(350, 290 + (t - 0.2) * 3) : 290
        const chamberTemp = t > 0.2 ? Math.min(2800, 1500 + (t - 0.2) * 70 + Math.sin(t * 2) * 50) : 290
        const nozzleTemp = t > 0.2 ? Math.min(2200, 1200 + (t - 0.2) * 55 + Math.sin(t * 3) * 40) : 290
        
        // Oxidizer density (N2O is temperature sensitive)
        const oxidizerDensity = t > 0.2 ? 730 - (injectorTemp - 290) * 2 : 730 // kg/m³
        
        // Pressure oscillation magnitude
        const pressureOscillation = t > 0.2 ? (chamberPressure - 14.7) * 0.03 * Math.sin(t * 25 * 2 * Math.PI) : 0
        
        const row = [
          t.toFixed(2),
          addNoise(thrustProfile, 0.8).toFixed(1),
          addNoise(chamberPressure, 1.0).toFixed(1),
          addNoise(oxidizerPressure, 0.5).toFixed(1),
          addNoise(fuelRegressionRate, 2.0).toFixed(4),
          addNoise(oxidizerFlow, 1.2).toFixed(3),
          addNoise(combustionEfficiency * 100, 0.5).toFixed(2),
          addNoise(mixRatio, 1.5).toFixed(2),
          addNoise(injectorTemp, 0.8).toFixed(1),
          addNoise(chamberTemp, 1.5).toFixed(0),
          addNoise(nozzleTemp, 1.2).toFixed(0),
          addNoise(pressureOscillation, 5.0).toFixed(2),
          addNoise(oxidizerDensity, 0.3).toFixed(1)
        ].join(',')
        
        data += row + '\n'
      }
      
      return header + data
    }
  },
  
  {
    id: 'electric-propulsion',
    name: 'Electric Arc Jet',
    type: 'Electrothermal Thruster',
    description: 'High-power electric arc jet thruster using ammonia propellant with electromagnetic heating and nozzle expansion',
    burnTime: '45 seconds',
    maxThrust: '0.45 N',
    isp: '580 seconds',
    characteristics: ['Electric heating', 'Ammonia propellant', 'High temperature', 'Power modulation'],
    csvData: () => {
      const header = 'time,thrust,arc_voltage,arc_current,power_consumption,propellant_flow,nozzle_temp,electrode_temp,chamber_pressure,exhaust_velocity,efficiency,propellant_temp\n'
      let data = ''
      
      for (let i = 0; i <= 450; i++) { // 45 seconds at 10Hz
        const t = i / 10
        
        // Electric arc jet operation profile
        let thrustProfile = 0
        let arcVoltage = 0
        let arcCurrent = 0
        let powerConsumption = 0
        let propellantFlow = 0
        let nozzleTemp = 300
        let electrodeTemp = 300
        let chamberPressure = 14.7
        let exhaustVelocity = 0
        let efficiency = 0
        let propellantTemp = 300
        
        if (t >= 2.0 && t < 43.0) {
          const operationTime = t - 2.0
          const totalOperationTime = 41.0
          
          // Power modulation - varies throughout burn
          const powerModulation = 1 + Math.sin(operationTime * 0.2) * 0.1 + Math.sin(operationTime * 0.05) * 0.05
          
          // Arc parameters (ensure positive values)
          arcVoltage = Math.max(0, 180 + Math.sin(operationTime * 0.3) * 15)
          arcCurrent = Math.max(0, 25 + Math.sin(operationTime * 0.4) * 3)
          powerConsumption = arcVoltage * arcCurrent * powerModulation / 1000 // kW
          
          // Propellant flow (ensure positive)
          propellantFlow = Math.max(0, 0.8e-6 + Math.sin(operationTime * 0.1) * 0.05e-6) // kg/s, reduced variation
          
          // Thrust calculation based on exhaust velocity (ensure positive)
          exhaustVelocity = Math.max(0, 5700 + Math.sin(operationTime * 0.2) * 100) // m/s, reduced variation
          thrustProfile = propellantFlow * exhaustVelocity // F = mdot * Ve (in Newtons)
          
          // Temperatures - very high due to electric heating
          nozzleTemp = Math.min(2500, 800 + operationTime * 40 + Math.sin(operationTime * 2) * 100)
          electrodeTemp = Math.min(3200, 1200 + operationTime * 50 + Math.sin(operationTime * 1.5) * 150)
          propellantTemp = Math.min(1800, 300 + operationTime * 35 + Math.sin(operationTime * 3) * 50)
          
          // Chamber pressure
          chamberPressure = 14.7 + (propellantFlow / 0.8e-6) * 25
          
          // Efficiency calculation
          const thrustPower = thrustProfile * exhaustVelocity / 2000 // Simplified thrust power
          efficiency = Math.min(65, (thrustPower / powerConsumption) * 100)
          
          // Add electrical noise and instability
          const electricalNoise = Math.sin(operationTime * 100) * 0.02
          thrustProfile *= (1 + electricalNoise)
          arcVoltage *= (1 + electricalNoise * 0.5)
          
        } else if (t >= 1.0 && t < 2.0) {
          // Startup phase
          const startupProgress = (t - 1.0) / 1.0
          arcVoltage = 180 * startupProgress
          arcCurrent = 25 * startupProgress
          powerConsumption = arcVoltage * arcCurrent / 1000
          nozzleTemp = 300 + (500 - 300) * startupProgress
          electrodeTemp = 300 + (900 - 300) * startupProgress
        } else if (t >= 43.0) {
          // Shutdown phase
          const shutdownProgress = Math.max(0, 1 - (t - 43.0) / 2.0)
          arcVoltage = 180 * shutdownProgress
          arcCurrent = 25 * shutdownProgress
          powerConsumption = arcVoltage * arcCurrent / 1000
          thrustProfile = 0.45 * shutdownProgress * shutdownProgress
          nozzleTemp = 300 + (nozzleTemp - 300) * shutdownProgress
        }
        
        const row = [
          t.toFixed(1),
          addNoise(thrustProfile, 1.0).toFixed(6),
          addNoise(arcVoltage, 0.8).toFixed(1),
          addNoise(arcCurrent, 1.2).toFixed(2),
          addNoise(powerConsumption, 0.5).toFixed(3),
          addNoise(propellantFlow * 1e6, 2.0).toFixed(3), // Convert to mg/s
          addNoise(nozzleTemp, 1.5).toFixed(0),
          addNoise(electrodeTemp, 2.0).toFixed(0),
          addNoise(chamberPressure, 0.8).toFixed(1),
          addNoise(exhaustVelocity, 1.0).toFixed(0),
          addNoise(efficiency, 2.0).toFixed(2),
          addNoise(propellantTemp, 1.0).toFixed(0)
        ].join(',')
        
        data += row + '\n'
      }
      
      return header + data
    }
  }
]