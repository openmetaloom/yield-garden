/**
 * x402 Payment Handling
 * Official x402 SDK integration
 * https://github.com/coinbase/x402
 */
import {
  createPaymentRequirements,
  type PaymentRequirements,
  type PaymentAuthorization,
} from '@x402/core';
import { createSigner, verifyAuthorization } from '@x402/evm';
import type { X402PaymentRequest, X402PaymentAuthorization } from '@yield-garden/shared';
import { createWalletClient, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia, base } from 'viem/chains';

export class X402Handler {
  private recipientAddress: Address;
  private chainId: number;
  private signer: ReturnType<typeof createSigner>;

  constructor(recipientAddress: Address, chainId: number, privateKey: `0x${string}`) {
    this.recipientAddress = recipientAddress;
    this.chainId = chainId;
    
    // Create viem wallet client for signing
    const account = privateKeyToAccount(privateKey);
    const client = createWalletClient({
      account,
      chain: chainId === 8453 ? base : baseSepolia,
      transport: http(),
    });
    
    // Create x402 signer
    this.signer = createSigner(client);
  }

  /**
   * Create a payment requirements object (what the client needs to pay)
   */
  createPaymentRequirements(
    amountUsdc: number,
    description: string
  ): PaymentRequirements {
    return createPaymentRequirements({
      scheme: 'exact',
      network: this.chainId === 8453 ? 'base' : 'base-sepolia',
      amount: amountUsdc.toString(),
      recipient: this.recipientAddress,
      requiredDeadlineSeconds: 300, // 5 minutes
      description,
    });
  }

  /**
   * Format payment message for XMTP (human readable)
   */
  formatPaymentMessage(requirements: PaymentRequirements, workDescription: string): string {
    const amount = requirements.maxAmountRequired;
    const network = requirements.network;
    
    return `
💰 Payment Required

Amount: ${amount} USDC
Network: ${network}
Description: ${workDescription}

To proceed, please authorize this payment via x402 protocol.
Reply with your signed authorization.

Recipient: ${this.recipientAddress}
Chain ID: ${this.chainId}
`;
  }

  /**
   * Verify a payment authorization from the client
   */
  async verifyAuthorization(
    authorization: PaymentAuthorization,
    requirements: PaymentRequirements
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const isValid = await verifyAuthorization(authorization, requirements);
      
      if (!isValid) {
        return { valid: false, error: 'Invalid authorization signature' };
      }
      
      // Additional checks
      if (authorization.recipient !== this.recipientAddress.toLowerCase()) {
        return { valid: false, error: 'Recipient mismatch' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: `Verification failed: ${error}` };
    }
  }

  /**
   * Process and settle the payment
   * Returns transaction hash on success
   */
  async settlePayment(
    authorization: PaymentAuthorization
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      // Use the x402 signer to settle the payment on-chain
      const result = await this.signer.settlePayment(authorization);
      
      return {
        success: true,
        txHash: result.transactionHash,
      };
    } catch (error) {
      return {
        success: false,
        error: `Settlement failed: ${error}`,
      };
    }
  }

  /**
   * Parse authorization from client message
   */
  parseAuthorization(message: string): PaymentAuthorization | null {
    try {
      // Try to extract JSON from message
      const jsonMatch = message.match(/```json\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : message;
      
      const auth = JSON.parse(jsonStr) as PaymentAuthorization;
      
      // Validate required fields
      if (!auth.authorization || !auth.signature) {
        return null;
      }
      
      return auth;
    } catch {
      return null;
    }
  }
}

export function createX402Handler(
  recipientAddress: Address, 
  chainId: number,
  privateKey: `0x${string}`
): X402Handler {
  return new X402Handler(recipientAddress, chainId, privateKey);
}
