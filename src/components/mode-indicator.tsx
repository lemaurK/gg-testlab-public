'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Cloud, HardDrive } from 'lucide-react'
import { getDeploymentMode, getDeploymentConfig } from '@/lib/deployment-modes'

export function ModeIndicator() {
  const [config, setConfig] = useState(getDeploymentConfig())

  useEffect(() => {
    setConfig(getDeploymentConfig())
  }, [])

  const isPublic = config.mode === 'public'

  return (
    <Badge 
      variant={isPublic ? 'secondary' : 'default'} 
      className={`text-xs ${isPublic ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
    >
      {isPublic ? (
        <>
          <Cloud className="h-3 w-3 mr-1" />
          Public Demo
        </>
      ) : (
        <>
          <HardDrive className="h-3 w-3 mr-1" />
          Local Mode
        </>
      )}
    </Badge>
  )
}