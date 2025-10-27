# Confidential Health Inference 

It shows how Fully Homomorphic Encryption (FHE) could enable **private ML inference** over user data. It is an educational scaffold: replace placeholder encryption calls with real Zama Concrete/TFHE client and coprocessor endpoints for a production-ready build.

## What Zama Confidential Health Inference does
- You type in simple health metrics (age, blood pressure, glucose).
- Your web browser encrypts these numbers locally (so the raw data never leaves your device).
- The encrypted data is sent on-chain to a contract.
- A coprocessor (or relayer) "runs the model" on encrypted data and posts an encrypted result back to the contract.
- The result can be decrypted only by the user (via KMS) or verified via signed proof — the model never sees your raw inputs.

## Quick start 
1. Install dependencies (use Node 18+):
   ```bash
   git clone <this-repo-url>
   cd zama-confidential-health
   npm install
   cd frontend && npm install
   ```

2. Start a local dev node (or use fhEVM testnet) and deploy the contract:
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network fhevmTestnet
   ```

3. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   npm run dev -- --host 0.0.0.0
   ```

4. (Optional) Run the relayer to simulate coprocessor work:
   ```bash
   cd coprocessor
   npm install ethers dotenv
   node relayer.js
   ```

## Zama tools used
- Use Zama's WASM client (Concrete/TFHE) for encryption in `frontend/src/zamaclient.js`.
- Use Zama's coprocessor or GPU endpoints in `coprocessor/relayer.js` to run real encrypted ML inference.
- Integrate KMS/Gateway calls to request threshold decryption and to fetch global public keys.

## Security notes
- NEVER send plaintext health data to servers. Only ciphertext should go to on-chain or off-chain services.
- This demo intentionally uses simulated encryption for simplicity. Replace with audited FHE libraries for real privacy guarantees.

## Resources
- Zama Docs: https://docs.zama.ai
- TFHE/Concrete libraries: see Zama & Concrete repos


