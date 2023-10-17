import { MockConnector, MockProvider } from '@wagmi/core/connectors/mock';
import { ethers } from 'ethers';
import {
  Address as BtcAddress,
  AddressPurpose,
  BitcoinNetwork,
  GetAddressResponse,
  getAddress,
} from 'sats-connect';
import { http, createWalletClient } from 'viem';
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

const id = 'xverse';
const name = 'Xverse Wallet';
const walletClient = createWalletClient({
  account: ethers.Wallet.createRandom(),
  chain: mainnet,
  transport: http(),
});

// ----------------------------------------------------------------------------------

// xverse connector
class XverseConnector extends MockConnector {
  id = id;
  name = name;
  walletClient = walletClient;
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
    account: any;
    chain: {
      id: number;
      unsupported: boolean;
    };
  }> {
    try {
      await getAddress({
        onCancel: () => {},
        onFinish: (res: GetAddressResponse) => {
          const v = res.addresses.find((item) => item.purpose === 'payment');

          // save btc address
          this.btcNetwork.address = (v as BtcAddress)?.address;
        },
        payload: {
          message: 'Connect Xverse wallet',
          network: this.btcNetwork,
          purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
        },
      });

      return {
        account: walletClient.account,
        chain: { id: 1, unsupported: false },
      };
    } catch {
      return {
        account: '',
        chain: { id: 1, unsupported: true },
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

  id,

  name,
});
