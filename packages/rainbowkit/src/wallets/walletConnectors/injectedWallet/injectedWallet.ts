/* eslint-disable sort-keys-fix/sort-keys-fix */
import type { InjectedConnectorOptions } from '@wagmi/core/dist/connectors/injected';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { Chain } from '../../../components/RainbowKitProvider/RainbowKitChainContext';
import { Wallet } from '../../Wallet';

// ----------------------------------------------------------------------------------

// mock trust wallet
function mkTrust() {
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  const params = url.searchParams;
  return params.get('only') === 'trust';
}

// ----------------------------------------------------------------------------------

export interface InjectedWalletOptions {
  chains: Chain[];
}

export const injectedWallet = ({
  chains,
  ...options
}: InjectedWalletOptions & InjectedConnectorOptions): Wallet => {
  const isMock = mkTrust();
  const name = isMock ? 'Trust Wallet' : 'Browser Wallet';
  const iconUrl = isMock
    ? async () => (await import('./injectedWallet.svg')).default
    : async () => (await import('../trustWallet/trustWallet.svg')).default;

  return {
    id: 'injected',
    name,
    iconUrl,
    iconBackground: '#fff',
    hidden: ({ wallets }) =>
      wallets.some(
        wallet =>
          wallet.installed &&
          wallet.name === wallet.connector.name &&
          (wallet.connector instanceof InjectedConnector ||
            wallet.id === 'coinbase')
      ),
    createConnector: () => ({
      connector: new InjectedConnector({
        chains,
        options,
      }),
    }),
  };
};
