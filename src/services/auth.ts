/**
 * Authentication Service
 *
 * Handles JWT token management, including:
 * - Secure storage of tokens
 * - Token refresh logic
 * - Expiration checks
 * - Session validation
 *
 * SECURITY NOTE: Tokens are stored in SecureStore (encrypted on device)
 * and automatically refreshed before expiration.
 */

import { supabase } from "./supabaseClient"
import { setItem, getItem, deleteItem } from "../utils/storage"

const TOKEN_KEY = "auth_token"
const REFRESH_TOKEN_KEY = "refresh_token"
const TOKEN_EXPIRY_KEY = "token_expiry"

/**
 * Token payload structure
 */
interface TokenPayload {
  token: string
  refreshToken: string
  expiresAt: number // Unix timestamp
}

/**
 * Stores authentication tokens securely
 * Uses cross-platform storage for encrypted storage
 */
export async function storeTokens(
  token: string,
  refreshToken: string,
  expiresIn = 3600, // Default 1 hour
): Promise<void> {
  try {
    const expiresAt = Date.now() + expiresIn * 1000

    await setItem(TOKEN_KEY, token)
    await setItem(REFRESH_TOKEN_KEY, refreshToken)
    await setItem(TOKEN_EXPIRY_KEY, expiresAt.toString())
  } catch (error) {
    console.error("[Auth] Failed to store tokens:", error)
    throw new Error("Failed to store authentication tokens")
  }
}

/**
 * Retrieves stored authentication token
 * Automatically refreshes if expired or near expiration
 */
export async function getToken(): Promise<string | null> {
  try {
    const token = await getItem(TOKEN_KEY)
    const expiryStr = await getItem(TOKEN_EXPIRY_KEY)

    if (!token || !expiryStr) {
      return null
    }

    const expiresAt = Number.parseInt(expiryStr, 10)
    const now = Date.now()

    // Refresh if token expires in less than 5 minutes
    const shouldRefresh = expiresAt - now < 5 * 60 * 1000

    if (shouldRefresh) {
      console.log("[Auth] Token near expiration, refreshing...")
      const newToken = await refreshToken()
      return newToken
    }

    return token
  } catch (error) {
    console.error("[Auth] Failed to get token:", error)
    return null
  }
}

/**
 * Refreshes the authentication token using the refresh token
 * Called automatically when token is near expiration
 */
export async function refreshToken(): Promise<string | null> {
  try {
    const refreshTokenValue = await getItem(REFRESH_TOKEN_KEY)

    if (!refreshTokenValue) {
      console.log("[Auth] No refresh token available")
      return null
    }

    // Use Supabase's built-in token refresh
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshTokenValue,
    })

    if (error || !data.session) {
      console.error("[Auth] Token refresh failed:", error)
      await clearTokens()
      return null
    }

    // Store new tokens
    await storeTokens(data.session.access_token, data.session.refresh_token, data.session.expires_in || 3600)

    console.log("[Auth] Token refreshed successfully")
    return data.session.access_token
  } catch (error) {
    console.error("[Auth] Token refresh error:", error)
    return null
  }
}

/**
 * Checks if the current token is valid and not expired
 */
export async function isTokenValid(): Promise<boolean> {
  try {
    const expiryStr = await getItem(TOKEN_EXPIRY_KEY)

    if (!expiryStr) {
      return false
    }

    const expiresAt = Number.parseInt(expiryStr, 10)
    const now = Date.now()

    return expiresAt > now
  } catch (error) {
    console.error("[Auth] Failed to check token validity:", error)
    return false
  }
}

/**
 * Clears all stored authentication tokens
 * Called on logout or when tokens are invalid
 */
export async function clearTokens(): Promise<void> {
  try {
    await deleteItem(TOKEN_KEY)
    await deleteItem(REFRESH_TOKEN_KEY)
    await deleteItem(TOKEN_EXPIRY_KEY)
    console.log("[Auth] Tokens cleared")
  } catch (error) {
    console.error("[Auth] Failed to clear tokens:", error)
  }
}

/**
 * Creates authorization header for API requests
 * Automatically includes valid JWT token
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken()

  if (!token) {
    throw new Error("No valid authentication token available")
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}
