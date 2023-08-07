import '../styles/global.css';
import '@rainbow-me/rainbowkit/styles.css';
import { ReactNode } from 'react';
import type { AppProps } from 'next/app';
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  RainbowKitAuthenticationProvider,
} from '@rainbow-me/rainbowkit';

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
import { authenticationAdapter } from '../js/auth';

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

const { wallets } = getDefaultWallets({
  appName: 'RainbowKit demo',
  projectId,
  chains,
});

const demoAppInfo = {
  appName: 'Rainbowkit Demo',
};

const connectors = connectorsForWallets([
  // ...wallets,
  {
    groupName: 'Other',
    wallets: [
      hiroWallet({ btcNetwork: {} }),
      // argentWallet({ projectId, chains }),
      // trustWallet({ projectId, chains }),
      // ledgerWallet({ projectId, chains }),
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
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </WagmiConfig>
  );
}

function AuthProvider(props: PropsType) {
  const status = 'unauthenticated';

  return (
    <RainbowKitAuthenticationProvider
      adapter={authenticationAdapter}
      status={status}
    >
      <RainbowKitProvider appInfo={demoAppInfo} chains={chains}>
        {props.children}
      </RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  );
}

export default MyApp;
