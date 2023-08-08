// import { AppConfig, showConnect, UserSession } from '@stacks/connect';
import '@stacks/connect';
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
  network: 'testnet' | 'mainnet';
}
// const appConfig = new AppConfig(['store_write', 'publish_data']);
// const userSession = new UserSession({ appConfig });

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
    // @ts-ignore
    return Boolean(window?.StacksProvider);
  }

  // ----------------------------------------------------------------------------------

  // connect wallet
  async connect(): Promise<{
    account: ErcAddress;
    chain: { id: number; unsupported: boolean };
  }> {
    if (!this.checkDevice()) {
      return {
        account: '',
        chain: { id: 1, unsupported: true },
      };
    }

    // const self = this;

    // function setAddr() {
    //   let v = userSession.loadUserData().profile.btcAddress.p2wpkh.mainnet;
    //   if (self.btcNetwork?.network === 'testnet') {
    //     v = userSession.loadUserData().profile.btcAddress.p2wpkh.testnet;
    //   }

    //   self.btcNetwork.address = v;
    // }

    try {
      const res = await window.StacksProvider?.request('getAddresses');
      const address = res?.result.addresses ?? [];
      const info = address.find(
        (addr: { type: string }) => addr.type === 'p2wpkh'
      );

      if (!info) {
        return {
          account: '',
          chain: { id: 1, unsupported: true },
        };
      }

      // eslint-disable-next-line no-console
      console.log(info);

      this.btcNetwork = Object.assign(this.btcNetwork, info);

      return {
        account: mockWallet.address as ErcAddress,
        chain: { id: 1, unsupported: false },
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);

      return {
        account: '',
        chain: { id: 0, unsupported: true },
      };
    }

    // return new Promise(async (resolve, reject) => {
    //   if (!self.checkDevice()) {
    //     return;
    //   }

    //   try {
    //     // eslint-disable-next-line no-console
    //     console.log(self);

    //     if (!userSession.isUserSignedIn()) {
    //       showConnect({
    //         appDetails: {
    //           icon: 'https://lh3.googleusercontent.com/ZsW7VmclMiIJiIDvfs24j0jum9WM4-a7NlU8Wvievwp6AHj8shlBrX2oZXvNyhWWhMAW6ZJlAlExMDTXvWRipEhZ',
    //           name: 'Deputy Network',
    //         },
    //         onCancel: () => {
    //           reject({
    //             account: '',
    //             chain: { id: 0, unsupported: false },
    //           });
    //         },
    //         onFinish: () => {
    //           setAddr();
    //         },
    //         userSession,
    //       });
    //     } else {
    //       setAddr();
    //       resolve({
    //         account: mockWallet.address as ErcAddress,
    //         chain: { id: 1, unsupported: false },
    //       });
    //     }
    //   } catch (e: any) {
    //     reject({
    //       account: '',
    //       chain: { id: 0, unsupported: false },
    //     });
    //   }
    // });
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
