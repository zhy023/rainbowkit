'use client';
import { ConnectButton, useAddressCurrent } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';

const Home: NextPage = () => {
  const { btcInfo, isBtcWallet, address, signBtcMessage } = useAddressCurrent();
  const [v, setV] = useState(false);
  useEffect(() => {
    setV(true);
    console.log(window.trustwallet);
  }, []);

  async function sign() {
    const v = await signBtcMessage('test');
    console.log(v);
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: 12,
        }}
      >
        <ConnectButton />
      </div>
      {v && (
        <div>
          <p>address: {address}</p>
          <p>btc address: {btcInfo.address}</p>
          <p>btc: {isBtcWallet.toString()}</p>
          <button onClick={sign}>sign message</button>
          <button>send tx</button>
        </div>
      )}
    </div>
  );
};

export default Home;
