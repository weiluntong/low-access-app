import { YStack, XStack, Card, Text } from 'tamagui'

interface ConnectionErrorBannerProps {
  error: string
}

export const ConnectionErrorBanner = ({ error }: ConnectionErrorBannerProps) => {
  if (!error) return null
  
  return (
    <Card bordered padding="$3" backgroundColor="$red1" borderColor="$red7" width="100%" maxWidth={600}>
      <XStack gap="$2" alignItems="center">
        <Text color="$red11" fontSize="$4">⚠️</Text>
        <YStack flex={1}>
          <Text color="$red11" fontWeight="bold" fontSize="$3">
            Connection Issue
          </Text>
          <Text color="$red10" fontSize="$2">
            {error}
          </Text>
        </YStack>
      </XStack>
    </Card>
  )
}
