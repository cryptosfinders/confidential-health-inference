/*
  zamaclient.js
  Demo integration using TFHE-rs browser WASM API (tfhe npm package).
  IMPORTANT: This demo generates client keys locally for testing purposes ONLY.
  In production you must use KMS / Gateway keys and never expose secret keys.
*/

// tfhe import assumes the npm package 'tfhe' that wraps tfhe-rs wasm for browser.
import init, {
  initThreadPool,
  init_panic_hook,
  ShortintParametersName,
  ShortintParameters,
  Shortint // shortint high-level API
} from 'tfhe';

let initialized = false;

export async function initTfhe() {
  if (initialized) return;
  await init(); // initialize wasm
  // optional: initThreadPool(navigator.hardwareConcurrency);
  await init_panic_hook();
  initialized = true;
}

// For demo: generate client key, produce server key to allow evaluation.
export async function demoGenerateKeys() {
  await initTfhe();
  const params = new ShortintParameters(ShortintParametersName.PARAM_MESSAGE_2_CARRY_2_KS_PBS_TUNIFORM_2M128);
  const clientKey = Shortint.new_client_key(params); // secret key (keep private)
  const serverKey = Shortint.new_compressed_server_key(clientKey); // evaluation key (share to server)
  // serialize server key to send to relayer if desired
  const serializedServerKey = Shortint.serialize_compressed_server_key(serverKey);
  const serializedClientKey = Shortint.serialize_client_key(clientKey);
  return { serializedServerKey, serializedClientKey };
}

// Encrypt a small integer (e.g., age or simple metric)
export async function encryptUint32(clientKeySerialized, value) {
  await initTfhe();
  const clientKey = Shortint.deserialize_client_key(clientKeySerialized);
  const ct = Shortint.encrypt(clientKey, BigInt(value));
  const ser = Shortint.serialize_ciphertext(ct);
  return ser; // Uint8Array-like (ArrayBuffer) or base64 when transmitted
}

// Helper to create base64 from Uint8Array for on-chain submission
export function toHex(bytes) {
  if (!bytes) return "0x";
  const u8 = new Uint8Array(bytes);
  let hex = "0x";
  for (let i = 0; i < u8.length; i++) {
    hex += u8[i].toString(16).padStart(2, '0');
  }
  return hex;
}
