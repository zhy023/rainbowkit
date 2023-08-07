import { AppConfig, showConnect, UserSession } from '@stacks/connect';
// @todo network config
import { Address as ErcAddress } from '@wagmi/core';
import { MockConnector, MockProvider } from '@wagmi/core/connectors/mock';
import { ethers } from 'ethers';
import { Address, createWalletClient, http } from 'viem';

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
  btcNetwork: {
    network?: 'testnet' | 'mainnet';
    address?: string;
  };
}
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

const mockWallet = ethers.Wallet.createRandom();

const walletClient = createWalletClient({
  account: mockWallet.address as Address,
  chain: mainnet,
  transport: http(),
});

// ----------------------------------------------------------------------------------

// hiro connector
class HiroConnector extends MockConnector {
  walletType = 'hiro';
  walletClient = walletClient;
  mockWallet = mockWallet;
  btcNetwork: HiroOptions['btcNetwork'];

  // ----------------------------------------------------------------------------------

  constructor(options: HiroOptions) {
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
    return Boolean(window?.HiroWalletProvider);
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
      if (!self.checkDevice()) {
        return;
      }

      try {
        // eslint-disable-next-line no-console
        console.log(self);
        if (!userSession.isUserSignedIn()) {
          showConnect({
            appDetails: {
              icon: 'https://lh3.googleusercontent.com/ZsW7VmclMiIJiIDvfs24j0jum9WM4-a7NlU8Wvievwp6AHj8shlBrX2oZXvNyhWWhMAW6ZJlAlExMDTXvWRipEhZ',
              name: 'Deputy Network',
            },
            onCancel: () => {
              reject({
                account: '',
                chain: { id: 0, unsupported: false },
              });
            },
            onFinish: () => {
              let addr =
                userSession.loadUserData().profile.btcAddress.p2wpkh.mainnet;
              if (self.btcNetwork?.network === 'testnet') {
                addr =
                  userSession.loadUserData().profile.btcAddress.p2wpkh.testnet;
              }

              self.btcNetwork.address = addr;

              resolve({
                account: mockWallet.address as ErcAddress,
                chain: { id: 1, unsupported: false },
              });
            },
            userSession,
          });
        } else {
          resolve({
            account: mockWallet.address as ErcAddress,
            chain: { id: 1, unsupported: false },
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

  id: 'hiro-wallet',

  name: 'Hiro Wallet',
});
