import React, { useState } from 'react';
import { ethers } from 'ethers';
import { demoGenerateKeys, encryptUint32, toHex } from './zamaclient';
import abi from '../../artifacts/contracts/HealthInference.sol/HealthInference.json';

export default function App() {
  const [age, setAge] = useState('30');
  const [bp, setBp] = useState('120');
  const [glucose, setGlucose] = useState('90');
  const [status, setStatus] = useState('');
  const [clientKey, setClientKey] = useState(null);
  const [serverKey, setServerKey] = useState(null);

  async function handlePrepareKeys() {
    try {
      setStatus('Generating demo keys in browser (demo only)...');
      const { serializedServerKey, serializedClientKey } = await demoGenerateKeys();
      setClientKey(serializedClientKey);
      setServerKey(serializedServerKey);
      setStatus('✅ Demo keys ready. You can now submit encrypted payloads.');
      console.log("Demo keys generated successfully");
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to generate keys. Check console for details.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!clientKey) {
      alert('Please generate demo keys first (Demo mode). In production use KMS.');
      return;
    }

    try {
      setStatus('🔐 Encrypting metrics...');
      const encAge = await encryptUint32(clientKey, Number(age));
      const encBp = await encryptUint32(clientKey, Number(bp));
      const encGl = await encryptUint32(clientKey, Number(glucose));

      const encAgeHex = toHex(encAge);
      const encBpHex = toHex(encBp);
      const encGlHex = toHex(encGl);

      if (!window.ethereum) {
        alert('Install MetaMask');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_ADDRESS, abi.abi, signer);

      setStatus('🚀 Submitting encrypted payload...');
      const tx = await contract.submitPayload(encAgeHex); // demo only: just Age
      await tx.wait();

      setStatus(`✅ Submitted successfully! Tx: ${tx.hash}`);
      console.log('Tx hash:', tx.hash);
    } catch (err) {
      console.error(err);
      setStatus('❌ Error during encryption or submission. Check console.');
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'Arial' }}>
      <h2>Confidential Health Inference (CHI)</h2>
      <p>
        This demo uses TFHE-rs in the browser to generate keys and encrypt small integers.
        <b> Do not use demo keys in production.</b>
      </p>
      <div style={{ marginBottom: 12 }}>
        <button onClick={handlePrepareKeys}>Generate Demo Keys (Browser)</button>
      </div>
      <form onSubmit={handleSubmit}>
        <div><label>Age: <input value={age} onChange={e => setAge(e.target.value)} /></label></div>
        <div><label>Blood Pressure: <input value={bp} onChange={e => setBp(e.target.value)} /></label></div>
        <div><label>Glucose: <input value={glucose} onChange={e => setGlucose(e.target.value)} /></label></div>
        <button type="submit">Encrypt & Submit (demo)</button>
      </form>
      <p>{status}</p>
      <hr />
      <p><b>Note:</b> This demo passes only a single ciphertext to the contract for simplicity.
        In production you'd bundle payloads and use KMS + coprocessor server keys.
      </p>
    </div>
  );
}

