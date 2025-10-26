import { useState } from 'react'
import { useToastController } from '@tamagui/toast'
import { AUTH_CONFIG } from '@low-access/config'
import { Platform } from 'react-native'
import { useBackendApi } from './useBackendApi'

export function useTailscale(idToken: string | null) {
  const [tailscaleToken, setTailscaleToken] = useState<string | null>(null)
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)
  const toast = useToastController()
  const backendApi = useBackendApi()

  const generateTailscaleToken = async () => {
    if (!idToken) {
      toast.show('Error', {
        message: 'No authentication token available',
      })
      return
    }

    setIsGeneratingToken(true)
    try {
      // Use infrastructure service for circuit breaker protection
      const response = await backendApi.safeApiCall(() => 
        fetch(`${AUTH_CONFIG.backendUrl}/auth/generate-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            id_token: idToken,
            platform: Platform.OS 
          }),
        })
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.tailscale_token) {
        setTailscaleToken(data.tailscale_token)
        toast.show('Token Generated!', {
          message: 'Your Tailscale authentication token is ready',
        })
      } else {
        throw new Error(data.message || 'Failed to generate token')
      }
    } catch (error: any) {
      console.error('Token generation error:', error)
      toast.show('Generation Failed', {
        message: error.message || 'Failed to generate Tailscale token. Please try again.',
      })
    } finally {
      setIsGeneratingToken(false)
    }
  }

  const copyTokenToClipboard = async () => {
    if (tailscaleToken) {
      if (Platform.OS === 'web') {
        try {
          await navigator.clipboard.writeText(tailscaleToken)
          toast.show('Copied!', {
            message: 'Tailscale token copied to clipboard',
          })
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea')
          textArea.value = tailscaleToken
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          toast.show('Copied!', {
            message: 'Tailscale token copied to clipboard',
          })
        }
      } else {
        // For mobile - would use Expo Clipboard in real app
        toast.show('Token Ready', {
          message: 'Token available for Tailscale CLI',
        })
      }
    } else {
      toast.show('No Token', {
        message: 'Generate a token first',
      })
    }
  }

  return {
    tailscaleToken,
    isGeneratingToken,
    generateTailscaleToken,
    copyTokenToClipboard
  }
}
