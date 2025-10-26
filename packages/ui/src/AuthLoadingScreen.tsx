import { YStack, Card, Text, Paragraph } from 'tamagui'

export const AuthLoadingScreen = () => {
  return (
    <YStack gap="$4" width="100%" maxWidth={400} alignItems="center">
      <Card bordered padding="$4" backgroundColor="$background" width="100%">
        <YStack gap="$3" alignItems="center">
          <Text fontSize="$4">🔄</Text>
          <Paragraph textAlign="center">Loading saved session...</Paragraph>
        </YStack>
      </Card>
    </YStack>
  )
}
