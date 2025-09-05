export type DeploymentMode = 'public' | 'local'

export interface DeploymentConfig {
  mode: DeploymentMode
  isOffline: boolean
  showPrivacyDisclaimer: boolean
  enableAnalytics: boolean
  enableExternalRequests: boolean
  modelPath?: string
}

class DeploymentModeManager {
  private config: DeploymentConfig
  
  constructor() {
    this.config = this.detectDeploymentMode()
  }
  
  private detectDeploymentMode(): DeploymentConfig {
    // Check environment variables first
    const deploymentMode = process.env.NEXT_PUBLIC_DEPLOYMENT_MODE as DeploymentMode
    const isVercel = process.env.VERCEL === '1'
    const isNetlify = process.env.NETLIFY === 'true'
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Detect if running on localhost
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.startsWith('192.168.') ||
       window.location.hostname.startsWith('10.0.'))
    
    // Determine mode based on environment
    let mode: DeploymentMode = 'local'
    
    if (deploymentMode) {
      mode = deploymentMode
    } else if (isVercel || isNetlify) {
      mode = 'public'
    } else if (isProduction && !isLocalhost) {
      mode = 'public'
    }
    
    // Configure based on detected mode
    const config: DeploymentConfig = {
      mode,
      isOffline: mode === 'local',
      showPrivacyDisclaimer: mode === 'public',
      enableAnalytics: mode === 'public' && isProduction,
      enableExternalRequests: mode === 'public'
    }
    
    // Set model paths
    if (mode === 'local') {
      config.modelPath = '/models/burn-classifier.onnx'
    }
    
    return config
  }
  
  public getConfig(): DeploymentConfig {
    return { ...this.config }
  }
  
  public getMode(): DeploymentMode {
    return this.config.mode
  }
  
  public isPublicMode(): boolean {
    return this.config.mode === 'public'
  }
  
  public isLocalMode(): boolean {
    return this.config.mode === 'local'
  }
  
  public shouldShowPrivacyDisclaimer(): boolean {
    return this.config.showPrivacyDisclaimer
  }
  
  public canMakeExternalRequests(): boolean {
    return this.config.enableExternalRequests
  }
  
  public shouldEnableAnalytics(): boolean {
    return this.config.enableAnalytics
  }
  
  public getModelPath(): string | undefined {
    return this.config.modelPath
  }
  
  // Override configuration (for testing or manual control)
  public setMode(mode: DeploymentMode): void {
    this.config = {
      ...this.config,
      mode,
      isOffline: mode === 'local',
      showPrivacyDisclaimer: mode === 'public',
      enableAnalytics: mode === 'public',
      enableExternalRequests: mode === 'public'
    }
    
    if (mode === 'local') {
      this.config.modelPath = '/models/burn-classifier.onnx'
    } else {
      this.config.modelPath = undefined
    }
  }
  
  // Validate environment for current mode
  public validateEnvironment(): { isValid: boolean; issues: string[] } {
    const issues: string[] = []
    
    if (this.config.mode === 'local') {
      // Check for local mode requirements
      if (typeof window !== 'undefined' && navigator.onLine) {
        // Running in browser with internet - warn about privacy
        issues.push('Local mode detected but internet connection available')
      }
      
      // Could add checks for required local files, etc.
    } else if (this.config.mode === 'public') {
      // Check for public mode requirements
      if (typeof window !== 'undefined' && !navigator.onLine) {
        issues.push('Public mode requires internet connection')
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues
    }
  }
  
  // Get environment info for debugging
  public getEnvironmentInfo(): Record<string, any> {
    return {
      mode: this.config.mode,
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      netlify: process.env.NETLIFY,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      online: typeof window !== 'undefined' ? navigator.onLine : true,
      config: this.config
    }
  }
}

// Global instance with lazy initialization
let deploymentManager: DeploymentModeManager | null = null

const getDeploymentManager = () => {
  if (!deploymentManager) {
    deploymentManager = new DeploymentModeManager()
  }
  return deploymentManager
}

export default getDeploymentManager

// Convenience exports
export const getDeploymentMode = () => getDeploymentManager().getMode()
export const isPublicMode = () => getDeploymentManager().isPublicMode()
export const isLocalMode = () => getDeploymentManager().isLocalMode()
export const shouldShowPrivacyDisclaimer = () => getDeploymentManager().shouldShowPrivacyDisclaimer()
export const canMakeExternalRequests = () => getDeploymentManager().canMakeExternalRequests()
export const shouldEnableAnalytics = () => getDeploymentManager().shouldEnableAnalytics()
export const getModelPath = () => getDeploymentManager().getModelPath()
export const getDeploymentConfig = () => getDeploymentManager().getConfig()

// Development helpers
export const setDeploymentMode = (mode: DeploymentMode) => getDeploymentManager().setMode(mode)
export const validateDeploymentEnvironment = () => getDeploymentManager().validateEnvironment()
export const getEnvironmentInfo = () => getDeploymentManager().getEnvironmentInfo()