import '../styles/global.css';
import '@rainbow-me/rainbowkit/styles.css';
import { ReactNode } from 'react';
import type { AppProps } from 'next/app';
import {
  BtcProvider,
  RainbowKitProvider,
  connectorsForWallets,
  RainbowKitAuthenticationProvider,
} from '@rainbow-me/rainbowkit';
import { metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';

import {
  // argentWallet,
  // trustWallet,
  // ledgerWallet,
  hiroWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  zora,
  goerli,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { useAtom } from 'jotai';
import { useAuth, authAtom } from '../js/auth';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    zora,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [goerli] : []),
  ],
  [publicProvider()]
);

const projectId = 'YOUR_PROJECT_ID';

const demoAppInfo = {
  appName: 'Rainbowkit Demo',
};

const connectors = connectorsForWallets([
  {
    groupName: 'Other',
    wallets: [
      metaMaskWallet({
        chains,
        projectId,
        shimDisconnect: true,
        walletConnectVersion: '2',
        walletConnectOptions: {
          projectId,
          metadata: {
            name: 'Trust Wallet',
            url: '',
            description: '',
            icons: ['https://deputy.network/logos/logo-192x192.png'],
          },
        },
      }),
      hiroWallet({ network: 'testnet' }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

type PropsType = {
  children: ReactNode;
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <BtcProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </BtcProvider>
    </WagmiConfig>
  );
}

function AuthProvider(props: PropsType) {
  const [auth] = useAtom(authAtom);
  const { authenticationAdapter } = useAuth();

  return (
    <RainbowKitAuthenticationProvider
      adapter={authenticationAdapter}
      status={auth}
    >
      <RainbowKitProvider appInfo={demoAppInfo} chains={chains}>
        {props.children}
      </RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  );
}

export default MyApp;
