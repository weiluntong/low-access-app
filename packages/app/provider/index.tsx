import { useColorScheme } from 'react-native'
import {
  NativeToast,
  TamaguiProvider,
  type TamaguiProviderProps,
  ToastProvider,
  config,
} from '@low-access/ui'
import { ToastViewport } from './ToastViewport'

export function Provider({
  children,
  defaultTheme = 'light',
  ...rest
}: Omit<TamaguiProviderProps, 'config'> & { defaultTheme?: string }) {
  const colorScheme = useColorScheme()
  const theme = defaultTheme || (colorScheme === 'dark' ? 'dark' : 'light')

  return (
    <TamaguiProvider config={config} defaultTheme={theme} {...rest}>
      <ToastProvider swipeDirection="horizontal" duration={6000} native={[]}>
        {children}
        <NativeToast />
        <ToastViewport />
      </ToastProvider>
    </TamaguiProvider>
  )
}
