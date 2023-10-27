import '../styles/global.css';
import '@rainbow-me/rainbowkit/styles.css';
import { ReactNode } from 'react';
import type { AppProps } from 'next/app';
import {
  lightTheme,
  RainbowKitProvider,
  connectorsForWallets,
  RainbowKitAuthenticationProvider,
} from '@rainbow-me/rainbowkit';
import { metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';

import { trustWallet, leatherWallet } from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
  goerli,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

import { useAtom } from 'jotai';
import { useAuth, authAtom } from '../js/auth';

const theme = lightTheme();
theme.fonts.body = 'PoppinsMedium';
theme.radii.modal = '16px';
theme.radii.modalMobile = '16px';
theme.shadows.dialog = 'none';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    zora,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [goerli] : []),
  ],
  [publicProvider()]
);

const projectId = 'cc7e352f0f7e60a5e695cfb3e65f7072';

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
      trustWallet({ chains, projectId, shimDisconnect: true }),
      leatherWallet({ network: 'testnet' }),
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
  const [auth] = useAtom(authAtom);
  const { authenticationAdapter } = useAuth();

  return (
    <RainbowKitAuthenticationProvider
      adapter={authenticationAdapter}
      status={auth}
    >
      <RainbowKitProvider
        modalSize="compact"
        theme={theme}
        appInfo={demoAppInfo}
        chains={chains}
      >
        {props.children}
      </RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  );
}

export default MyApp;
