// Type declarations for Web Crypto API
interface RsaHashedKeyAlgorithm {
  name: string;
  modulusLength: number;
  publicExponent: Uint8Array;
  hash: string;
}

interface RsaPssParams {
  name: 'RSA-PSS';
  saltLength: number;
}

// Extend Window interface
declare global {
  interface Window {
    crypto: {
      subtle: {
        generateKey(
          algorithm: RsaHashedKeyAlgorithm,
          extractable: boolean,
          keyUsages: string[]
        ): Promise<CryptoKeyPair>;
        
        exportKey(
          format: 'jwk',
          key: CryptoKey
        ): Promise<JsonWebKey>;
        
        importKey(
          format: 'jwk',
          keyData: JsonWebKey,
          algorithm: { name: 'RSA-PSS'; hash: string },
          extractable: boolean,
          keyUsages: string[]
        ): Promise<CryptoKey>;
        
        sign(
          algorithm: RsaPssParams,
          key: CryptoKey,
          data: BufferSource
        ): Promise<ArrayBuffer>;
        
        verify(
          algorithm: RsaPssParams,
          key: CryptoKey,
          signature: BufferSource,
          data: BufferSource
        ): Promise<boolean>;
      };
      randomUUID: () => string;
    };
  }
}

export {};