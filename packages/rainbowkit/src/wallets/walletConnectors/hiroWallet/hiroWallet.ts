import '@stacks/connect';
import { MockConnector, MockProvider } from '@wagmi/core/connectors/mock';
import { createTestClient, http, publicActions, walletActions } from 'viem';
import { foundry } from 'viem/chains';
import {
  BtcAddressInfo,
  def,
} from '../../../components/RainbowKitProvider/btcStore';
import { Wallet } from '../../Wallet';

type HiroOptions = {
  network: BtcAddressInfo['network'];
};

declare global {
  interface Window {
    btc?: {
      request(method: string, params?: any[]): Promise<Record<string, any>>;
    };
  }
}

/**
 * ----------------------------------------------------------------------------------
 * hiroWallet
 * ----------------------------------------------------------------------------------
 *
 * @author zhangmao 2023/07/04
 */

// ----------------------------------------------------------------------------------

const id = 'hiro';
const name = 'Hiro Wallet';

const walletClient = createTestClient({
  account: {
    address: '',
  },
  chain: foundry,
  mode: 'hardhat',
  transport: http(),
})
  .extend(publicActions)
  .extend(walletActions);

const mockProvider = new MockProvider({
  chainId: foundry.id,
  id,
  name,
  walletClient,
});

// ----------------------------------------------------------------------------------

// hiro connector
class HiroConnector extends MockConnector {
  id = id;
  name = name;
  btcData: BtcAddressInfo = def;

  constructor(optios: HiroOptions) {
    super({
      options: { id, name, walletClient },
    });

    this.btcData.network = optios.network;
  }

  async connect() {
    if (typeof window === 'undefined' || typeof window.btc === 'undefined') {
      return;
    }

    const res = await window.btc.request('getAddresses');
    const address = res?.result.addresses ?? [];
    const info = address.find(
      (addr: { type: string }) => addr.type === 'p2wpkh'
    );

    if (!info) {
      return;
    }

    this.btcData = Object.assign(this.btcData, info);
  }

  async getProvider() {
    return mockProvider;
  }

  async getWalletClient() {
    return walletClient;
  }
}

// ----------------------------------------------------------------------------------

export const hiroWallet = (optios: HiroOptions): Wallet => {
  const isHiroInjected =
    typeof window !== 'undefined' &&
    typeof window.StacksProvider !== 'undefined' &&
    typeof window.StacksProvider?.request !== 'undefined';
  const shouldUseWalletConnect = !isHiroInjected;

  return {
    createConnector: () => {
      const connector = new HiroConnector(optios);
      return {
        connector,
      };
    },
    downloadUrls: {
      browserExtension: 'https://wallet.hiro.so/#download',
      chrome: 'https://wallet.hiro.so/wallet/install-web',
      firefox: 'https://addons.mozilla.org/en-US/firefox/addon/hiro-wallet',
      // android: '',
      // ios: '',
      // mobile: '',
      // qrCode: '',
      // edge: '',
      // opera: '',
    },
    iconBackground: '#000000',
    iconUrl:
      'https://lh3.googleusercontent.com/ZsW7VmclMiIJiIDvfs24j0jum9WM4-a7NlU8Wvievwp6AHj8shlBrX2oZXvNyhWWhMAW6ZJlAlExMDTXvWRipEhZ',
    id,
    installed: !shouldUseWalletConnect ? isHiroInjected : undefined,
    name,
  };
};
