import '@stacks/connect';
import {
  MockConnector,
  MockProviderOptions,
} from '@wagmi/core/connectors/mock';
import { createTestClient, http } from 'viem';
import { Chain, foundry } from 'viem/chains';
import { Wallet } from '../../Wallet';

/**
 * ----------------------------------------------------------------------------------
 * hiroWallet
 * ----------------------------------------------------------------------------------
 *
 * @author zhangmao 2023/07/04
 */

// ----------------------------------------------------------------------------------

export interface HiroOptions {
  network: 'testnet' | 'mainnet';
}

type MockConnectorOptions = Omit<MockProviderOptions, 'chainId'> & {
  chainId?: number;
};

const id = 'hiro';
const name = 'Hiro Wallet';

// ----------------------------------------------------------------------------------

function checkDevice() {
  return Boolean(window?.StacksProvider);
}

// ----------------------------------------------------------------------------------

// hiro connector
class HiroConnector extends MockConnector {
  btcNetwork: any;

  constructor({
    chains,
    options,
  }: {
    chains?: Chain[];
    options: MockConnectorOptions;
  }) {
    super({ chains, options });
  }

  async connect() {
    if (!checkDevice()) {
      return;
    }

    // await super.connect({ chainId });

    const res = await window.StacksProvider?.request('getAddresses');
    const address = res?.result.addresses ?? [];
    const info = address.find(
      (addr: { type: string }) => addr.type === 'p2wpkh'
    );

    if (!info) {
      return;
    }

    this.btcNetwork = info;
  }
}

// ----------------------------------------------------------------------------------

export const hiroWallet = (options: HiroOptions): Wallet => ({
  createConnector: () => {
    const connector = new HiroConnector({
      options: {
        id,
        name,
        walletClient: createTestClient({
          chain: foundry,
          mode: 'hardhat',
          transport: http(),
        }),
      },
    });

    // eslint-disable-next-line no-console
    console.log(options);

    // ----------------------------------------------------------------------------------

    return {
      connector,
    };
  },
  downloadUrls: {
    android: 'https://wallet.hiro.so/wallet/install-desktop',
    chrome: 'https://wallet.hiro.so/wallet/install-web',
    ios: 'https://wallet.hiro.so/wallet/install-desktop',
    qrCode: 'https://wallet.hiro.so/#download',
  },
  iconBackground: '#000000',
  iconUrl:
    'https://lh3.googleusercontent.com/ZsW7VmclMiIJiIDvfs24j0jum9WM4-a7NlU8Wvievwp6AHj8shlBrX2oZXvNyhWWhMAW6ZJlAlExMDTXvWRipEhZ',

  id,

  name,
});
