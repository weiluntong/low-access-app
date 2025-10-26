import { ToastViewport as TamaguiToastViewport } from '@tamagui/toast'

export const ToastViewport = () => {
  return (
    <TamaguiToastViewport
      flexDirection="column"
      top="$4"
      left={0}
      right={0}
      multipleToasts
    />
  )
}
