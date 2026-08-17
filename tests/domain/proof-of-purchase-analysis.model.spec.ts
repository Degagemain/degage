import { describe, expect, it } from 'vitest';
import { proofOfPurchaseAnalysisSchema } from '@/domain/proof-of-purchase-analysis.model';

describe('proofOfPurchaseAnalysisSchema', () => {
  it('parses a recognized proof of purchase with price', () => {
    const result = proofOfPurchaseAnalysisSchema.safeParse({
      isProofOfPurchase: true,
      purchasePriceInclVat: 24990.5,
    });
    expect(result.success).toBe(true);
  });

  it('parses a rejected document with null price', () => {
    const result = proofOfPurchaseAnalysisSchema.safeParse({
      isProofOfPurchase: false,
      purchasePriceInclVat: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing fields', () => {
    const result = proofOfPurchaseAnalysisSchema.safeParse({
      isProofOfPurchase: true,
    });
    expect(result.success).toBe(false);
  });
});
