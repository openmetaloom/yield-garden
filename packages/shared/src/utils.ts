/**
 * Shared utility functions
 */

/**
 * Format address for display (0x1234...5678)
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Check if string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Check if string looks like an Ethereum signature (0x + 130 hex chars)
 */
export function isSignature(content: string): boolean {
  return /0x[a-fA-F0-9]{130}/.test(content);
}

/**
 * Extract signature from message content
 */
export function extractSignature(content: string): string | null {
  const match = content.match(/(0x[a-fA-F0-9]{130})/);
  return match ? match[1] : null;
}

/**
 * Extract counter-offer amount from message
 */
export function extractCounterOffer(content: string): number | null {
  const patterns = [
    /\$?(\d+(?:\.\d{2})?)\s*(?:usdc|dollar|usd)?/i,
    /(?:offer|propose|suggest)\s+\$?(\d+(?:\.\d{2})?)/i,
    /(\d+(?:\.\d{2})?)\s*(?:is|seems|sounds)/i,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0 && amount < 10000) {
        return amount;
      }
    }
  }
  return null;
}

/**
 * Extract tier selection from message
 */
export function extractTierSelection(content: string): number | null {
  const lower = content.toLowerCase();
  
  if (/minimum|min|tier\s*(one|1)/.test(lower)) return 0;
  if (/standard|tier\s*(two|2)/.test(lower)) return 1;
  if (/premium|tier\s*(three|3)/.test(lower)) return 2;
  
  return null;
}

/**
 * Generate deterministic response based on item name
 */
export function generatePlaceholderResponse(item: string): string {
  const templates = [
    `Here's your ${item}. It's crafted with precision and ready for use.`,
    `Your ${item} is complete. Delivered as requested.`,
    `${item.charAt(0).toUpperCase() + item.slice(1)} delivered. No questions asked.`,
    `Here's your ${item}. Exactly what you asked for.`,
  ];
  return templates[item.length % templates.length];
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
