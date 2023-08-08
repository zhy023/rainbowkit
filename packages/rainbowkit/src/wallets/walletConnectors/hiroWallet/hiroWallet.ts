import '@stacks/connect';
import { MockConnector, MockProvider } from '@wagmi/core/connectors/mock';
// import { ethers } from 'ethers';
import { createWalletClient, http } from 'viem';
import { mainnet } from 'wagmi/chains';
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

const id = 'hiro';
const name = 'Hiro Wallet';
const walletClient = createWalletClient({
  // account: ethers.Wallet.createRandom(),
  account: '',
  chain: mainnet,
  transport: http(),
});

// ----------------------------------------------------------------------------------

// hiro connector
class HiroConnector extends MockConnector {
  id = id;
  name = name;
  walletClient = walletClient;
  btcNetwork: HiroOptions & {
    address: string;
    derivationPath: string;
    publicKey: string;
    symbol: string;
    type: string;
  };

  // ----------------------------------------------------------------------------------

  constructor(options: HiroOptions) {
    super({
      options: {
        walletClient,
      },
    });

    this.btcNetwork = Object.assign(
      { address: '', derivationPath: '', publicKey: '', symbol: '', type: '' },
      options
    );
  }

  // ----------------------------------------------------------------------------------

  checkDevice() {
    return Boolean(window?.StacksProvider);
  }

  // ----------------------------------------------------------------------------------

  // connect wallet
  async connect(): Promise<{
    account?: any;
    chain?: any;
  }> {
    if (!this.checkDevice()) {
      return {
        chain: { id: 0, unsupported: true },
      };
    }

    try {
      const res = await window.StacksProvider?.request('getAddresses');
      const address = res?.result.addresses ?? [];
      const info = address.find(
        (addr: { type: string }) => addr.type === 'p2wpkh'
      );

      if (!info) {
        return {
          chain: { id: 0, unsupported: true },
        };
      }

      this.btcNetwork = Object.assign(this.btcNetwork, info);

      return {
        chain: { id: 0, unsupported: false },
      };
    } catch {
      return {
        chain: { id: 0, unsupported: true },
      };
    }
  }

  async getProvider() {
    return new MockProvider({
      // chainId: 0,
      walletClient,
    });
  }

  async getWalletClient() {
    return walletClient;
  }
}

// ----------------------------------------------------------------------------------

export const hiroWallet = (options: HiroOptions): Wallet => ({
  createConnector: () => {
    const connector = new HiroConnector(options);

    // ----------------------------------------------------------------------------------

    return {
      connector,
      mobile: {
        getUri: async () => {
          await connector.connect();
          return '';
        },
      },
      qrCode: {
        getUri: async () => {
          await connector.connect();
          return '';
        },
      },
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
