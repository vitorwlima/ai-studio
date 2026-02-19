const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12;
const HEX_256_KEY_PATTERN = /^[0-9a-fA-F]{64}$/;
let importedKeyPromise: Promise<CryptoKey> | null = null;
let importedLegacyKeyPromise: Promise<CryptoKey | null> | null = null;

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY?.trim();
  if (!key) {
    throw new Error(
      "ENCRYPTION_KEY is not set. Configure it in Convex env vars."
    );
  }
  return key;
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error("Invalid hex input");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function legacyHexToBytes(input: string): Uint8Array {
  const bytes = new Uint8Array(Math.floor(input.length / 2));
  for (let i = 0; i < input.length; i += 2) {
    bytes[i / 2] = parseInt(input.substring(i, i + 2), 16);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function deriveKeyBytes(secret: string): Promise<Uint8Array> {
  // Keep legacy behavior for pre-existing 64-hex secrets.
  if (HEX_256_KEY_PATTERN.test(secret)) {
    return hexToBytes(secret);
  }

  // For human-readable secrets, derive a stable 256-bit key.
  const encodedSecret = new TextEncoder().encode(secret);
  const digest = await crypto.subtle.digest("SHA-256", encodedSecret);
  return new Uint8Array(digest);
}

async function importKey(): Promise<CryptoKey> {
  if (!importedKeyPromise) {
    importedKeyPromise = (async () => {
      const keyBytes = await deriveKeyBytes(getEncryptionKey());
      return crypto.subtle.importKey(
        "raw",
        toArrayBuffer(keyBytes),
        ALGORITHM,
        false,
        ["encrypt", "decrypt"]
      );
    })().catch((error) => {
      importedKeyPromise = null;
      throw error;
    });
  }
  return importedKeyPromise;
}

async function importLegacyKey(): Promise<CryptoKey | null> {
  if (!importedLegacyKeyPromise) {
    importedLegacyKeyPromise = (async () => {
      const secret = getEncryptionKey();
      if (HEX_256_KEY_PATTERN.test(secret)) {
        return null;
      }

      const legacyBytes = legacyHexToBytes(secret);
      if (![16, 24, 32].includes(legacyBytes.length)) {
        return null;
      }

      try {
        return await crypto.subtle.importKey(
          "raw",
          toArrayBuffer(legacyBytes),
          ALGORITHM,
          false,
          ["encrypt", "decrypt"]
        );
      } catch {
        return null;
      }
    })().catch((error) => {
      importedLegacyKeyPromise = null;
      throw error;
    });
  }
  return importedLegacyKeyPromise;
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await importKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);
  const algorithm: AesGcmParams = {
    name: ALGORITHM,
    iv: toArrayBuffer(iv),
  };
  const ciphertext = await crypto.subtle.encrypt(
    algorithm,
    key,
    toArrayBuffer(encoded)
  );
  // Store as iv:ciphertext (both hex-encoded)
  return `${bytesToHex(iv)}:${bytesToHex(new Uint8Array(ciphertext))}`;
}

export async function decrypt(encrypted: string): Promise<string> {
  const parts = encrypted.split(":");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error("Invalid encrypted payload format");
  }

  const key = await importKey();
  const [ivHex, ciphertextHex] = parts;
  const iv = hexToBytes(ivHex);
  const ciphertext = hexToBytes(ciphertextHex);
  const algorithm: AesGcmParams = {
    name: ALGORITHM,
    iv: toArrayBuffer(iv),
  };
  try {
    const decrypted = await crypto.subtle.decrypt(
      algorithm,
      key,
      toArrayBuffer(ciphertext)
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    const legacyKey = await importLegacyKey();
    if (legacyKey) {
      try {
        const decrypted = await crypto.subtle.decrypt(
          algorithm,
          legacyKey,
          toArrayBuffer(ciphertext)
        );
        return new TextDecoder().decode(decrypted);
      } catch {
        // Continue to the final error below.
      }
    }

    throw new Error("Failed to decrypt OpenRouter key. Check ENCRYPTION_KEY.");
  }
}

export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return "****";
  return `${apiKey.slice(0, 10)}...${apiKey.slice(-2)}`;
}
