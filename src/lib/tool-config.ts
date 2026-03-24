/**
 * TOOL CONFIGURATION
 *
 * Update these values for each new tool.
 * This is the single source of truth for tool-specific settings.
 */

export const TOOL_CONFIG = {
  /** Display name of the tool (e.g. "JSON Formatter") */
  name: 'CSS Gradient Generator',

  /** Short tagline (e.g. "Format and validate JSON instantly") */
  tagline: 'Design stunning CSS gradients with a visual editor',

  /** Full URL of the deployed tool */
  url: 'https://free-css-gradient.codama.dev/',

  /** localStorage key prefix to avoid collisions between tools */
  storagePrefix: 'codama-css-gradient',
} as const
