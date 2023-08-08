import { MockConnector, MockProvider } from '@wagmi/core/connectors/mock';
import { ethers } from 'ethers';
import { createWalletClient, http } from 'viem';
import { mainnet } from 'wagmi/chains';
import { Wallet } from '../../Wallet';

/**
 * ----------------------------------------------------------------------------------
 * unisatWallet
 * ----------------------------------------------------------------------------------
 *
 * @author zhangmao 2023/07/04
 */

// ----------------------------------------------------------------------------------

export interface UnisatOptions {
  network?: 'testnet' | 'mainnet';
}
const id = 'unisat';
const name = 'Unisat Wallet';
const walletClient = createWalletClient({
  account: ethers.Wallet.createRandom(),
  chain: mainnet,
  transport: http(),
});

// ----------------------------------------------------------------------------------

// unisat connector
class UnisatConnector extends MockConnector {
  id = id;
  name = name;
  walletClient = walletClient;
  btcNetwork: UnisatOptions & { address: string };

  // ----------------------------------------------------------------------------------

  constructor(options: UnisatOptions) {
    super({
      options: {
        walletClient,
      },
    });

    this.btcNetwork = Object.assign({ address: '' }, options);
  }

  // ----------------------------------------------------------------------------------

  checkDevice() {
    // @ts-ignore
    return Boolean(window?.unisat);
  }

  // ----------------------------------------------------------------------------------

  // connect wallet
  async connect(): Promise<{
    account: any;
    chain: {
      id: number;
      unsupported: boolean;
    };
  }> {
    try {
      // @ts-ignore
      const [address] = await window.unisat?.requestAccounts();
      this.btcNetwork.address = address;

      return {
        account: walletClient.account,
        chain: { id: 1, unsupported: false },
      };
    } catch (e) {
      return {
        account: '',
        chain: { id: 0, unsupported: true },
      };
    }
  }

  async getProvider() {
    return new MockProvider({
      chainId: 1,
      walletClient,
    });
  }

  async getWalletClient() {
    return walletClient;
  }
}

// ----------------------------------------------------------------------------------

export const unisatWallet = (options: UnisatOptions): Wallet => ({
  createConnector: () => {
    const connector = new UnisatConnector(options);

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
    android: 'https://unisat.io/download',
    chrome:
      'https://chrome.google.com/webstore/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo',
    ios: 'https://unisat.io/download',
    qrCode: 'https://unisat.io/download',
  },

  iconBackground: '#000000',

  iconUrl:
    'https://lh3.googleusercontent.com/FpdgjbCU_f4VZUrc3uNC7RY70OIrDpn1bQM-eSw9tIgaGtztz7A_REOwDCxFsZMWnw43IWCEn9PtD2A8Y0env7lB2OU',

  id,

  name,
});
