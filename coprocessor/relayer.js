/*
coprocessor using tfhe (node) wasm API.
  It listens for submissions and "evaluates" encrypted shortint by decrypting with client key.
  In production: the server should perform homomorphic evaluation using server/evaluation key and never have client secret keys.
*/
const ethers = require('ethers');
require('dotenv').config();
const CONTRACT_ADDR = process.env.CONTRACT_ADDR;
const RPC = process.env.RPC_URL || 'http://localhost:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

const abi = require('../artifacts/contracts/HealthInference.sol/HealthInference.json').abi;

async function main() {
  // Load tfhe node wasm binding
  const tfhe = require('tfhe'); // assumes 'tfhe' npm package built for node (node-tfhe)
  const { Shortint, ShortintParametersName, ShortintParameters } = tfhe;

  const provider = new ethers.providers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDR, abi, wallet);

  console.log('Relayer connected, watching for submissions...');

  contract.on('PayloadSubmitted', async (user) => {
    console.log('Payload submitted:', user);
    // retrieve ciphertext stored in mapping (demo reading storage is illustrative)
    const ciphertextHex = await contract.encryptedPayload(user);
    console.log('Ciphertext hex:', ciphertextHex.toString().slice(0,100) + '...');

    // decrypt by asking user to provide client key (insecure) or using a pre-shared demo key.
    // For this demo script we'll expect CLIENT_KEY env var containing serialized client key in hex/base64.
    if (!process.env.CLIENT_KEY) {
      console.warn('CLIENT_KEY not provided - skipping decryption in demo relayer.');
      return;
    }

    const clientKeySerialized = Buffer.from(process.env.CLIENT_KEY, 'hex');
    // Deserialize client key and ciphertext, then decrypt
    const params = new ShortintParameters(ShortintParametersName.PARAM_MESSAGE_2_CARRY_2_KS_PBS_TUNIFORM_2M128);
    const cks = Shortint.deserialize_client_key(clientKeySerialized);
    // In tfhe node API you must also deserialize ciphertext: here we assume it's a Uint8Array hex string
    const ctBytes = ethers.AbiCoder.prototype.decode(['bytes'], ethers.utils.hexlify(ciphertextHex))[0];
    const decrypted = Shortint.decrypt(cks, ctBytes); // decrypt to BigInt
    console.log('Decrypted value (demo):', decrypted.toString());

    // Publish an encrypted result (demo uses a fake encrypted blob)
    const fakeEncryptedResult = ethers.utils.toUtf8Bytes('enc_result:low_risk');
    const tx = await contract.publishEncryptedResult(user, fakeEncryptedResult);
    await tx.wait();
    console.log('Published encrypted result tx:', tx.hash);
  });
}

main().catch(console.error);
