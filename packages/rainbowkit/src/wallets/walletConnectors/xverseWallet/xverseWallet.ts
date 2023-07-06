import { Address as ErcAddress } from '@wagmi/core';
import { MockConnector, MockProvider } from '@wagmi/core/connectors/mock';
import { ethers } from 'ethers';
import {
  AddressPurposes,
  BitcoinNetwork,
  Address as BtcAddress,
  getAddress,
  GetAddressResponse,
} from 'sats-connect';
import { Address, createWalletClient, http } from 'viem';
import { mainnet } from 'wagmi/chains';
import { Wallet } from '../../Wallet';

/**
 * ----------------------------------------------------------------------------------
 * xverseWallet
 * ----------------------------------------------------------------------------------
 *
 * @author zhangmao 2023/07/04
 */

// ----------------------------------------------------------------------------------

export interface XverseOptions {
  btcNetwork: BitcoinNetwork;
}

const mockWallet = ethers.Wallet.createRandom();

const walletClient = createWalletClient({
  account: mockWallet.address as Address,
  chain: mainnet,
  transport: http(),
});

// ----------------------------------------------------------------------------------

// xverse connector
class XverseConnector extends MockConnector {
  walletType = 'xverse';
  walletClient = walletClient;
  mockWallet = mockWallet;
  btcNetwork: BitcoinNetwork;

  // ----------------------------------------------------------------------------------

  constructor(options: XverseOptions) {
    super({
      options: {
        walletClient,
      },
    });

    this.btcNetwork = options.btcNetwork;
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
    return new Promise(async (resole, reject) => {
      try {
        await getAddress({
          onCancel: () => {
            reject({
              account: '',
              chain: { id: 1, unsupported: false },
            });
          },
          onFinish: (res: GetAddressResponse) => {
            const v = res.addresses.find(item => item.purpose === 'payment');

            // save btc address
            self.btcNetwork.address = (v as BtcAddress)?.address;

            resole({
              account: mockWallet.address as ErcAddress,
              chain: { id: 1, unsupported: false },
            });
          },
          payload: {
            message: 'Connect Xverse wallet',
            network: self.btcNetwork,
            purposes: [AddressPurposes.ORDINALS, AddressPurposes.PAYMENT],
          },
        });
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

export const xverseWallet = (options: XverseOptions): Wallet => ({
  createConnector: () => {
    const connector = new XverseConnector(options);

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
    android:
      'https://play.google.com/store/apps/details?id=com.secretkeylabs.xverse',
    chrome:
      'https://chrome.google.com/webstore/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg',
    ios: 'https://apps.apple.com/app/xverse-bitcoin-web3-wallet/id1552272513',
    qrCode: 'https://www.xverse.app/download',
  },

  iconBackground: '#000000',

  iconUrl:
    'https://play-lh.googleusercontent.com/UiUoRVY5QVI5DAZyP5s6xanuPRrd8HNbKGpjKt3HVPVuT6VJcnXVqR7V4ICQ9rYRCg',

  id: 'xverse-wallet',

  name: 'Xverse Wallet',
});
