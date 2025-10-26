import { 
  H1, 
  Paragraph, 
  YStack,
  AuthLoadingScreen,
  ConnectionErrorBanner,
  LoginScreen,
  UserInfoCard,
} from '@low-access/ui'
import { Platform } from 'react-native'
import { useAuth, useTailscale } from './hooks'

export function HomeScreen() {
  const {
    user,
    idToken,
    isLoading,
    isLoadingPersistedState,
    connectionError,
    isCheckingBackend,
    handleLogin,
    handleLogout,
    refreshUserStatus,
  } = useAuth()

  const {
    tailscaleToken,
    isGeneratingToken,
    generateTailscaleToken,
    copyTokenToClipboard,
  } = useTailscale(idToken)

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" gap="$4" padding="$4" backgroundColor="$background">
      <H1 textAlign="center" color="$color12">
        League of Winners Access
      </H1>
      <Paragraph color="$color10" textAlign="center">
        {Platform.OS === 'ios' ? '📱 iOS' : Platform.OS === 'android' ? '📱 Android' : '💻 Desktop'}
        {' • '}Tailscale Authentication
      </Paragraph>

      {/* Loading persisted state */}
      {isLoadingPersistedState ? (
        <AuthLoadingScreen />
      ) : (
        <>
          {/* Connection Status Indicator - Only show if there's an error */}
          {connectionError && (
            <ConnectionErrorBanner error={connectionError} />
          )}

          {!user ? (
            <LoginScreen 
              onLogin={handleLogin}
              isCheckingBackend={isCheckingBackend}
            />
          ) : (
            <UserInfoCard 
              user={user}
              onLogout={handleLogout}
              onRefresh={refreshUserStatus}
              isRefreshing={isLoading}
              tailscaleToken={tailscaleToken}
              isGeneratingToken={isGeneratingToken}
              onGenerateToken={generateTailscaleToken}
              onCopyToken={copyTokenToClipboard}
            />
          )}
        </>
      )}
    </YStack>
  )
}