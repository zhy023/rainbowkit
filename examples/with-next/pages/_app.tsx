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
  argentWallet,
  trustWallet,
  ledgerWallet,
  xverseWallet,
  hiroWallet,
  unisatWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, zora } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { useAuthAdapter } from '../module/auth/use_auth_adapter';
import { useAuthStore } from '../module/auth/auth';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum, zora],
  [publicProvider()]
);

const projectId = 'cc7e352f0f7e60a5e695cfb3e65f7072';

const { wallets } = getDefaultWallets({
  appName: 'RainbowKit demo',
  projectId,
  chains,
});

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
      xverseWallet({
        btcNetwork: {
          type: 'Testnet',
        },
      }),
      hiroWallet({ btcNetwork: {} }),
      unisatWallet({ btcNetwork: {} }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </WagmiConfig>
  );
}

function AuthProvider(props: { children: ReactNode }) {
  const { authAdapter } = useAuthAdapter();
  const status = useAuthStore(state => state.status);

  return (
    <RainbowKitAuthenticationProvider adapter={authAdapter} status={status}>
      <RainbowKitProvider coolMode chains={chains}>
        <div>{props.children}</div>
      </RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  );
}

export default MyApp;
