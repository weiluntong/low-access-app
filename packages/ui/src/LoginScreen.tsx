import { Button, YStack, Card, H3, Paragraph } from 'tamagui'

interface LoginScreenProps {
  isCheckingBackend: boolean
  onLogin: () => void
}

export const LoginScreen = ({ isCheckingBackend, onLogin }: LoginScreenProps) => {
  return (
    <YStack gap="$4" width="100%" maxWidth={400} alignItems="center">
      <Card bordered padding="$6" backgroundColor="$background" width="100%">
        <YStack gap="$4" alignItems="center">
          <H3 textAlign="center" color="$color12">
            🔐 Sign In Required
          </H3>
          <Paragraph textAlign="center" color="$color10">
            Please authenticate with Google to access Tailscale services
          </Paragraph>
          <Button
            size="$5"
            theme="blue"
            width="100%"
            onPress={onLogin}
            disabled={isCheckingBackend}
          >
            {isCheckingBackend ? '🔄 Checking Backend...' : '🔑 Sign In with Google'}
          </Button>
        </YStack>
      </Card>
    </YStack>
  )
}
