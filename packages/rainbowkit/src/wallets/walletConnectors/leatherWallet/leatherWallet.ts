import '@stacks/connect';
import { MockConnector, MockProvider } from '@wagmi/core/connectors/mock';
import { http, createTestClient, publicActions, walletActions } from 'viem';
import { foundry } from 'viem/chains';
import {
  BtcAddressInfo,
  def,
} from '../../../components/RainbowKitProvider/btcStore';
import { Wallet } from '../../Wallet';

type LeatherOptions = {
  network: BtcAddressInfo['network'];
};

/**
 * ----------------------------------------------------------------------------------
 * leatherWallet
 * ----------------------------------------------------------------------------------
 *
 * @author zhangmao 2023/07/04
 */

// ----------------------------------------------------------------------------------

const id = 'leather';
const name = 'Leather Wallet';

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

// leather connector
class LeatherConnector extends MockConnector {
  id = id;
  name = name;
  btcData: BtcAddressInfo = def;

  constructor(optios: LeatherOptions) {
    super({
      options: { id, name, walletClient },
    });

    this.btcData.network = optios.network;
  }

  async connect() {
    if (
      typeof window === 'undefined' ||
      typeof window.btc === 'undefined' ||
      // @ts-ignore
      this._eventsCount < 1
    ) {
      return;
    }

    const res = await window.btc.request('getAddresses');
    const address = res?.result.addresses ?? [];
    const info = address.find(
      (addr: { type: string }) => addr.type === 'p2wpkh',
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

export const leatherWallet = (optios: LeatherOptions): Wallet => {
  const isInstall =
    typeof window !== 'undefined' && typeof window.btc !== 'undefined';

  return {
    createConnector: () => {
      const connector = new LeatherConnector(optios);
      return {
        connector,
      };
    },
    downloadUrls: {
      browserExtension: 'https://leather.io/install-extension',
      chrome:
        'https://chrome.google.com/webstore/detail/leather/ldinpeekobnhjjdofggfgjlcehhmanlj',
      firefox: 'https://addons.mozilla.org/en-US/firefox/addon/leather-wallet',
      // android: '',
      // ios: '',
      // mobile: '',
      // qrCode: '',
      // edge: '',
      // opera: '',
    },
    iconBackground: '#00000',
    iconUrl:
      'https://lh3.googleusercontent.com/L2-6RY-R0J7MfguWZugMMEupyf60d9nY7tGT-vdJbKuxIVEEh0Kqu-5_G61hC47N5klx0p9196JCmS81dmJOA5OTIw',
    id,
    installed: isInstall || undefined,
    name,
  };
};
