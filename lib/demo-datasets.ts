// Optimized demo datasets for ThrustBench with realistic propulsion test data
// Reduced to 3 datasets with smaller sizes for better performance

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
    burnTime: '5.0 seconds',
    maxThrust: '2,850 N',
    isp: '335 seconds',
    characteristics: ['Turbopump fed', 'Regenerative cooling', 'Ignition transients', 'Combustion instability'],
    csvData: () => {
      const header = 'time,thrust,chamber_pressure,chamber_temp,oxidizer_flow,fuel_flow\n'
      let data = ''
      
      for (let i = 0; i <= 50; i++) { // 5.0 seconds at 10Hz
        const t = i / 10
        
        // Ignition phase (0-0.5s)
        let thrustProfile = 0
        let chamberPressure = 14.7 // Start at atmospheric
        
        if (t >= 0.1 && t < 0.5) {
          // Ignition transient
          const ignitionProgress = (t - 0.1) / 0.4
          thrustProfile = 2850 * Math.pow(ignitionProgress, 1.5) * (1 + Math.sin(t * 20) * 0.1)
          chamberPressure = pressureTransient(280, t - 0.1, 0.4) + 14.7
        } else if (t >= 0.5 && t < 4.5) {
          // Steady state with slight variations
          const variation = 1 + Math.sin(t * 2) * 0.02 + Math.sin(t * 8) * 0.01
          thrustProfile = 2850 * variation
          chamberPressure = 280 * variation + 14.7
        } else if (t >= 4.5) {
          // Shutdown phase
          const shutdownProgress = Math.max(0, 1 - (t - 4.5) / 0.5)
          thrustProfile = 2850 * shutdownProgress * shutdownProgress
          chamberPressure = (280 * shutdownProgress + 14.7)
        }
        
        // Essential metrics only
        const chamberTemp = t > 0.1 ? 1200 + (t - 0.1) * 50 + Math.sin(t * 3) * 20 : 293
        const oxidizerFlow = t >= 0.1 && t < 4.5 ? 2.8 + Math.sin(t * 1.5) * 0.1 : 0
        const fuelFlow = t >= 0.1 && t < 4.5 ? 1.1 + Math.sin(t * 1.8) * 0.05 : 0
        
        // Essential metrics with realistic noise
        const row = [
          t.toFixed(2),
          addNoise(thrustProfile, 0.3).toFixed(1),
          addNoise(chamberPressure, 0.5).toFixed(1),
          addNoise(chamberTemp, 0.8).toFixed(0),
          addNoise(oxidizerFlow, 1.5).toFixed(2),
          addNoise(fuelFlow, 1.5).toFixed(2)
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
    burnTime: '10.0 seconds',
    maxThrust: '4,200 N',
    isp: '242 seconds',
    characteristics: ['APCP propellant', 'Star grain', 'Throat erosion', 'Pressure oscillations'],
    csvData: () => {
      const header = 'time,thrust,chamber_pressure,nozzle_temp,throat_diameter,mass_remaining\n'
      let data = ''
      
      for (let i = 0; i <= 100; i++) { // 10.0 seconds at 10Hz
        const t = i / 10
        
        // Solid motor burn profile - starts high, decreases as grain burns
        let thrustProfile = 0
        let chamberPressure = 14.7
        let throatDiameter = 15.2 // mm, grows due to erosion
        let massRemaining = 8.5 // kg initial propellant
        
        if (t >= 0.05 && t < 9.5) {
          // Burn time calculation
          const burnProgress = (t - 0.05) / 9.45
          
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
        const nozzleTemp = t > 0.05 && t < 9.5 ? 950 + t * 120 + Math.sin(t * 5) * 25 : 293
        
        // Essential metrics with realistic noise
        const row = [
          t.toFixed(2),
          addNoise(thrustProfile, 0.4).toFixed(1),
          addNoise(chamberPressure, 0.6).toFixed(1),
          addNoise(nozzleTemp, 1.0).toFixed(0),
          addNoise(throatDiameter, 0.1).toFixed(2),
          addNoise(massRemaining, 0.2).toFixed(2)
        ].join(',')
        
        data += row + '\n'
      }
      
      return header + data
    }
  },

  {
    id: 'ion-thruster',
    name: 'Hall Effect Thruster',
    type: 'Electric Ion Propulsion',
    description: 'Xenon ion thruster with magnetic plasma confinement showing high specific impulse and steady operation',
    burnTime: '300 seconds',
    maxThrust: '0.092 N',
    isp: '1,650 seconds',
    characteristics: ['High ISP', 'Xenon propellant', 'Plasma discharge', 'Power efficient'],
    csvData: () => {
      const header = 'time,thrust,discharge_voltage,discharge_current,xenon_flow,power_consumption\n'
      let data = ''
      
      for (let i = 0; i <= 150; i++) { // 300 seconds at 0.5Hz (every 2 seconds)
        const t = i * 2
        
        let thrustProfile = 0
        let dischargeVoltage = 0
        let dischargeCurrent = 0
        let xenonFlow = 0
        let powerConsumption = 0
        
        if (t >= 5 && t < 295) { // Startup and steady operation
          const operationTime = t - 5
          
          // Startup phase (0-30s)
          let operationFactor = 1.0
          if (operationTime < 30) {
            operationFactor = operationTime / 30
          }
          
          // Steady operation with minor variations
          const variation = 1 + Math.sin(operationTime * 0.01) * 0.02
          
          thrustProfile = 0.092 * operationFactor * variation
          dischargeVoltage = 300 + Math.sin(operationTime * 0.02) * 5
          dischargeCurrent = 4.5 * operationFactor + Math.sin(operationTime * 0.03) * 0.1
          xenonFlow = 5.2e-6 * operationFactor // kg/s
          powerConsumption = dischargeVoltage * dischargeCurrent / 1000 // kW
        }
        
        // Essential metrics with realistic noise
        const row = [
          t.toFixed(1),
          addNoise(thrustProfile, 1.0).toFixed(4),
          addNoise(dischargeVoltage, 0.5).toFixed(1),
          addNoise(dischargeCurrent, 0.8).toFixed(2),
          addNoise(xenonFlow * 1e6, 2.0).toFixed(2), // Convert to mg/s for readability
          addNoise(powerConsumption, 1.2).toFixed(3)
        ].join(',')
        
        data += row + '\n'
      }
      
      return header + data
    }
  }
]