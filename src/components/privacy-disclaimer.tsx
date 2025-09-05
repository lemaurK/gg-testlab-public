'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Shield, 
  AlertTriangle, 
  Info, 
  Eye, 
  Server,
  Database,
  Globe
} from 'lucide-react'
import { shouldShowPrivacyDisclaimer, getDeploymentMode } from '@/lib/deployment-modes'
import { trackEvent } from '@/components/analytics'

interface PrivacyDisclaimerProps {
  onAccept: () => void
  onDecline: () => void
}

export function PrivacyDisclaimer({ onAccept, onDecline }: PrivacyDisclaimerProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [understandProcessing, setUnderstandProcessing] = useState(false)
  const [understandStorage, setUnderstandStorage] = useState(false)

  useEffect(() => {
    // Check if we should show the disclaimer
    const shouldShow = shouldShowPrivacyDisclaimer()
    const hasAccepted = localStorage.getItem('privacy-disclaimer-accepted') === 'true'
    
    setShowDisclaimer(shouldShow && !hasAccepted)
  }, [])

  const handleAccept = () => {
    if (acknowledged && understandProcessing && understandStorage) {
      localStorage.setItem('privacy-disclaimer-accepted', 'true')
      setShowDisclaimer(false)
      onAccept()
    }
  }

  const handleDecline = () => {
    localStorage.removeItem('privacy-disclaimer-accepted')
    trackEvent('privacy_disclaimer_declined', { mode: 'public' })
    onDecline()
  }

  const canAccept = acknowledged && understandProcessing && understandStorage

  if (!showDisclaimer) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            Privacy Notice - Public Demo Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Indicator */}
          <Alert>
            <Globe className="h-4 w-4" />
            <AlertDescription className="font-medium">
              You are using the public demo version hosted on {getDeploymentMode() === 'public' ? 'Vercel' : 'the cloud'}
            </AlertDescription>
          </Alert>

          {/* Main Privacy Notice */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-orange-800 mb-2">Data Processing</h3>
                <p className="text-sm text-gray-700 mb-2">
                  All file processing occurs entirely in your browser using client-side JavaScript. 
                  Your uploaded files are:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• <strong>Never uploaded to our servers</strong></li>
                  <li>• Processed locally in your browser memory</li>
                  <li>• Automatically cleared when you close the tab</li>
                  <li>• Not stored or cached anywhere permanently</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Server className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Server Interaction</h3>
                <p className="text-sm text-gray-700 mb-2">
                  This public demo does not require server communication for core functionality:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• No file uploads to external servers</li>
                  <li>• All AI processing runs in-browser (ONNX.js)</li>
                  <li>• Static hosting with no backend data collection</li>
                  <li>• No user accounts or persistent sessions</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-800 mb-2">Analytics & Monitoring</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Basic usage analytics may be collected for service improvement:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Page views and session duration (no personal data)</li>
                  <li>• Error reporting for debugging purposes</li>
                  <li>• Feature usage statistics (aggregated, anonymous)</li>
                  <li>• No tracking of file contents or analysis results</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>For sensitive data:</strong> Consider using the local/offline version of this tool 
              which runs completely disconnected from the internet and includes additional privacy protections.
            </AlertDescription>
          </Alert>

          {/* Consent Checkboxes */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium">Please confirm your understanding:</h4>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="understand-processing"
                  checked={understandProcessing}
                  onCheckedChange={(checked) => setUnderstandProcessing(checked as boolean)}
                />
                <label htmlFor="understand-processing" className="text-sm cursor-pointer leading-relaxed">
                  I understand that all file processing occurs in my browser and my files are not uploaded to servers
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="understand-storage"
                  checked={understandStorage}
                  onCheckedChange={(checked) => setUnderstandStorage(checked as boolean)}
                />
                <label htmlFor="understand-storage" className="text-sm cursor-pointer leading-relaxed">
                  I understand that no file data is stored permanently and all analysis results are cleared when I close the tab
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acknowledge-disclaimer"
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
                />
                <label htmlFor="acknowledge-disclaimer" className="text-sm cursor-pointer leading-relaxed">
                  I acknowledge this privacy notice and agree to the terms for using the public demo
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleAccept}
              disabled={!canAccept}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              Accept & Continue
            </Button>
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1"
            >
              Decline
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-500 text-center">
            <p>
              Need more privacy? Download the local version that runs completely offline.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}