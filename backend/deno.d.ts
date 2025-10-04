/**
 * Deno Type Declarations
 *
 * Provides type definitions for Deno-specific APIs used in Edge Functions.
 * This file is for type checking only and is not deployed.
 */

declare namespace Deno {
  export namespace env {
    export function get(key: string): string | undefined
  }
}
