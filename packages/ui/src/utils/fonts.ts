import { Platform } from 'react-native'

/**
 * Loads emoji fonts for consistent emoji rendering across platforms.
 * Uses Google Fonts Noto Color Emoji as a fallback for systems without emoji fonts.
 */
export const loadEmojiFont = () => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    // Load Google Fonts Noto Color Emoji
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    // Create comprehensive emoji CSS
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap');

      /* Global emoji font fallback with web font first */
      * {
        font-family: 'Inter', 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Twemoji Mozilla', 'Android Emoji', sans-serif !important;
      }

      /* Apply emoji rendering to most elements */
      body, body *,
      button, button *,
      span, div, p {
        font-variant-emoji: emoji !important;
      }

      /* Specific targeting for emoji characters */
      .emoji,
      .emoji-text,
      [class*="emoji"],
      button {
        font-family: 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', monospace !important;
        font-variant-emoji: emoji !important;
        font-feature-settings: 'liga' 1, 'clig' 1 !important;
      }

      /* Exclude ONLY numeric/ID content from emoji rendering */
      .numeric-text {
        font-variant-emoji: normal !important;
        font-family: 'Inter', monospace, sans-serif !important;
      }

      /* Ensure inputs don't get emoji fonts */
      input,
      textarea {
        font-variant-emoji: normal !important;
        font-family: 'Inter', sans-serif !important;
      }
    `
    
    document.head.appendChild(style)
  }
}