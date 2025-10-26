import { Card, XStack, YStack, Text, Paragraph, Button, H3 } from 'tamagui'
import { Platform } from 'react-native'
import type { UserInfo } from 'app'
import { getStatusColors, getStatusMessage } from './utils/user-status'

interface UserInfoCardProps {
  user: UserInfo
  onLogout: () => void
  onRefresh?: () => void
  isRefreshing?: boolean
  tailscaleToken?: string | null
  isGeneratingToken?: boolean
  onGenerateToken?: () => void
  onCopyToken?: () => void
}

export const UserInfoCard = ({ 
  user, 
  onLogout, 
  onRefresh,
  isRefreshing = false,
  tailscaleToken,
  isGeneratingToken = false,
  onGenerateToken,
  onCopyToken
}: UserInfoCardProps) => {
  const colors = getStatusColors(user.status)
  const statusInfo = getStatusMessage(user.status)

  return (
    <YStack gap="$4" width="100%" maxWidth={600}>
      {/* Status Card */}
      <Card 
        bordered 
        padding="$4" 
        backgroundColor={colors.bg} 
        borderColor={colors.border} 
        width="100%"
      >
        <YStack gap="$4">
          {/* Header with status */}
          <XStack gap="$3" alignItems="center">
            <Text fontSize="$5">{statusInfo.icon}</Text>
            <YStack flex={1}>
              <H3 color={colors.text} margin={0}>
                {statusInfo.title}
              </H3>
              <Text fontSize="$2" color={colors.accent}>
                {statusInfo.message}
              </Text>
            </YStack>
          </XStack>

          {/* User Details */}
          <YStack gap="$2" paddingTop="$2" borderTopWidth={1} borderTopColor={colors.border}>
            <XStack gap="$2" alignItems="center">
              <Text fontWeight="600" color={colors.text}>Name:</Text>
              <Text color={colors.text}>{user.name}</Text>
            </XStack>
            
            <XStack gap="$2" alignItems="center">
              <Text fontWeight="600" color={colors.text}>Email:</Text>
              <Text color={colors.text}>{user.email}</Text>
            </XStack>
            
            <XStack gap="$2" alignItems="center">
              <Text fontWeight="600" color={colors.text}>ID:</Text>
              <Text fontSize="$2" color={colors.accent} fontFamily="$body" className="numeric-text">
                {user.id}
              </Text>
            </XStack>
          </YStack>

          {/* Status-specific actions */}
          {user.status === 'pending' && onRefresh && (
            <YStack paddingTop="$2" borderTopWidth={1} borderTopColor={colors.border}>
              <Button
                size="$4"
                theme="blue"
                onPress={onRefresh}
                disabled={isRefreshing}
                width="100%"
              >
                {isRefreshing ? '🔄 Checking...' : '🔄 Check Status'}
              </Button>
            </YStack>
          )}

          {user.status === 'approved' && onGenerateToken && (
            <YStack gap="$3" paddingTop="$2" borderTopWidth={1} borderTopColor={colors.border}>
              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="600" color={colors.text}>
                  🔗 Tailscale Authentication
                </Text>
                <Paragraph fontSize="$3" color={colors.accent}>
                  {Platform.OS === 'web' 
                    ? 'Generate and copy your authentication token for Tailscale CLI'
                    : 'Generate your authentication token for Tailscale mobile app'
                  }
                </Paragraph>
              </YStack>

              <Button
                size="$4"
                theme="green"
                width="100%"
                onPress={onGenerateToken}
                disabled={isGeneratingToken}
              >
                {isGeneratingToken ? '🔄 Generating...' : '🎟️ Generate Tailscale Token'}
              </Button>

              {tailscaleToken && (
                <YStack gap="$3">
                  <Card padding="$3" backgroundColor="$backgroundPress" borderColor="$borderColor" bordered>
                    <Text 
                      fontSize="$3" 
                      fontFamily="$body"
                      color="$color11"
                      numberOfLines={3}
                      ellipsizeMode="middle"
                      userSelect="all"
                      className="numeric-text"
                    >
                      {tailscaleToken}
                    </Text>
                  </Card>

                  <XStack gap="$2">
                    <Button 
                      flex={1}
                      size="$3" 
                      theme="blue" 
                      onPress={onCopyToken}
                    >
                      📋 Copy Token
                    </Button>
                  </XStack>

                  <Paragraph fontSize="$2" color={colors.accent} textAlign="center">
                    Use this token with: tailscale login --authkey [token]
                  </Paragraph>
                </YStack>
              )}
            </YStack>
          )}
          
          {/* Sign Out Button - Always at bottom */}
          <YStack paddingTop="$3" borderTopWidth={1} borderTopColor={colors.border}>
            <Button
              size="$4"
              theme="red"
              onPress={onLogout}
              width="100%"
            >
              🚪 Sign Out
            </Button>
          </YStack>
        </YStack>
      </Card>
    </YStack>
  )
}
