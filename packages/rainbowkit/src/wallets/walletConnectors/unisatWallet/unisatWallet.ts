import { Address as ErcAddress } from '@wagmi/core';
import { MockConnector, MockProvider } from '@wagmi/core/connectors/mock';
import { ethers } from 'ethers';
import { Address, createWalletClient, http } from 'viem';
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
  btcNetwork: {
    network?: number;
    address?: string;
  };
}

const mockWallet = ethers.Wallet.createRandom();

const walletClient = createWalletClient({
  account: mockWallet.address as Address,
  chain: mainnet,
  transport: http(),
});

// ----------------------------------------------------------------------------------

// unisat connector
class UnisatConnector extends MockConnector {
  walletType = 'unisat';
  walletClient = walletClient;
  mockWallet = mockWallet;
  btcNetwork: UnisatOptions['btcNetwork'];

  // ----------------------------------------------------------------------------------

  constructor(options: UnisatOptions) {
    super({
      options: {
        walletClient,
      },
    });

    this.btcNetwork = options.btcNetwork;
  }

  // ----------------------------------------------------------------------------------

  checkDevice() {
    // @ts-ignore
    return Boolean(window?.unisat);
  }

  // ----------------------------------------------------------------------------------

  // connect wallet
  async connect(): Promise<{
    account: ErcAddress;
    chain: {
      id: number;
      unsupported: boolean;
    };
  }> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      // if (!self.checkDevice()) {
      //   return;
      // }

      try {
        try {
          // @ts-ignore
          const [address] = await window.unisat?.requestAccounts();
          self.btcNetwork.address = address;
          // @ts-ignore
          self.btcNetwork.network = window.unisat?.getNetwork();

          resolve({
            account: mockWallet.address as ErcAddress,
            chain: { id: 1, unsupported: false },
          });
        } catch (e) {
          reject({
            account: '',
            chain: { id: 0, unsupported: false },
          });
        }
      } catch (e: any) {
        reject({
          account: '',
          chain: { id: 0, unsupported: false },
        });
      }
    });
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

  id: 'unisat-wallet',

  name: 'Unisat Wallet',
});
