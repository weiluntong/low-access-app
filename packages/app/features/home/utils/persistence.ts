/**
 * AsyncStorage persistence utilities for auth state
 */
import AsyncStorage from '@react-native-async-storage/async-storage'
import { type UserInfo } from 'app'

const STORAGE_KEYS = {
  USER: 'low_access_user',
  TOKEN: 'low_access_token'
} as const

export interface PersistedAuthState {
  user: UserInfo | null
  token: string | null
}

/**
 * Load persisted authentication state from AsyncStorage
 */
export const loadPersistedAuth = async (): Promise<PersistedAuthState> => {
  try {
    const [savedUser, savedToken] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.USER),
      AsyncStorage.getItem(STORAGE_KEYS.TOKEN)
    ])

    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser) as UserInfo
      return { user: parsedUser, token: savedToken }
    }
  } catch (error) {
    console.error('Failed to load persisted auth:', error)
  }

  return { user: null, token: null }
}

/**
 * Save authentication state to AsyncStorage
 */
export const savePersistedAuth = async (user: UserInfo, token: string): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
      AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token)
    ])
  } catch (error) {
    console.error('Failed to save persisted auth:', error)
    throw error
  }
}

/**
 * Clear all persisted authentication data
 */
export const clearPersistedAuth = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN)
    ])
  } catch (error) {
    console.error('Failed to clear persisted auth:', error)
    throw error
  }
}