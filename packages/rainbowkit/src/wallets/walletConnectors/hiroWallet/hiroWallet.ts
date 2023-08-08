import '@stacks/connect';
import { MockConnector } from '@wagmi/core/connectors/mock';
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

// ----------------------------------------------------------------------------------

// hiro connector
// ----------------------------------------------------------------------------------

function checkDevice() {
  return Boolean(window?.StacksProvider);
}

// ----------------------------------------------------------------------------------

// connect wallet
async function connect(connector: any): Promise<any> {
  if (!checkDevice()) {
    return;
  }

  const res = await window.StacksProvider?.request('getAddresses');
  const address = res?.result.addresses ?? [];
  const info = address.find((addr: { type: string }) => addr.type === 'p2wpkh');

  if (!info) {
    return;
  }

  connector.btcNetwork = info;
}

// ----------------------------------------------------------------------------------

export const hiroWallet = (options: HiroOptions): Wallet => ({
  createConnector: () => {
    const connector = new MockConnector();
    connector.id = id;
    connector.name = name;
    // eslint-disable-next-line no-console
    console.log(options);

    // ----------------------------------------------------------------------------------

    return {
      connector,
      mobile: {
        getUri: async () => {
          await connect(connector);
          return '';
        },
      },
      qrCode: {
        getUri: async () => {
          await connect(connector);
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
