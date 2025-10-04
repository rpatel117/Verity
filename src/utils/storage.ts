/**
 * Cross-Platform Storage Utility
 *
 * Provides a unified storage interface that works on:
 * - iOS/Android: Uses expo-secure-store (encrypted)
 * - Web: Uses localStorage (browser storage)
 *
 * Automatically detects platform and uses appropriate storage method.
 */

import { Platform } from "react-native"
import * as SecureStore from "expo-secure-store"

/**
 * Stores a key-value pair securely
 * Uses SecureStore on mobile, localStorage on web
 */
export async function setItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value)
    } else {
      await SecureStore.setItemAsync(key, value)
    }
  } catch (error) {
    console.error(`[Storage] Failed to set item ${key}:`, error)
    throw error
  }
}

/**
 * Retrieves a value by key
 * Returns null if key doesn't exist
 */
export async function getItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(key)
    }
    return await SecureStore.getItemAsync(key)
  } catch (error) {
    console.error(`[Storage] Failed to get item ${key}:`, error)
    return null
  }
}

/**
 * Removes a key-value pair from storage
 */
export async function deleteItem(key: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(key)
    } else {
      await SecureStore.deleteItemAsync(key)
    }
  } catch (error) {
    console.error(`[Storage] Failed to delete item ${key}:`, error)
    throw error
  }
}
