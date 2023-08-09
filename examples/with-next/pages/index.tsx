'use client';
import { ConnectButton, useAddressCurrent } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';

const Home: NextPage = () => {
  const { btcInfo, isBtcWallet, address } = useAddressCurrent();
  const [v, setV] = useState(false);
  useEffect(() => {
    setV(true);
  }, []);

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
          <p>address: {btcInfo.address}</p>
          <p>btc: {isBtcWallet.toString()}</p>
          <p>eoa: {address}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
