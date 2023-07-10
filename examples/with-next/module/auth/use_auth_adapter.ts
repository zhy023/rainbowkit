import { SiweMessage } from 'siwe';
import { useAccount, Connector } from 'wagmi';
import { createAuthenticationAdapter } from '@rainbow-me/rainbowkit';
import { useAuthStore } from './auth';

/**
 * ----------------------------------------------------------------------------------
 * use_auth_adapter
 * ----------------------------------------------------------------------------------
 *
 * @author zhangmao
 */

const temp = {
  address: '',
};

export async function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

const isBitcoinConnect = (conn?: Connector): boolean =>
  ['xverse', 'hiro', 'unisat'].includes((conn as any)?.walletType);

// ----------------------------------------------------------------------------------

class BitcoinMessage {
  statement = '';

  constructor(options: { statement: string }) {
    Object.assign(this, options);
  }

  toMessage(): string {
    return this.statement || '';
  }
  prepareMessage(): string {
    return this.toMessage();
  }
}

// ----------------------------------------------------------------------------------

export function useAuthAdapter() {
  const setStatus = useAuthStore(state => state.setStatus);
  const { connector } = useAccount({
    onConnect({ address }) {
      if (!address) {
        return;
      }

      console.log(address);
      temp.address = address;
    },
  });

  // ----------------------------------------------------------------------------------

  const authAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      console.log(temp.address);
      await delay(1000);
      console.log('step one api----------');
      return '100';
    },

    createMessage: ({ nonce, address, chainId }) => {
      if (isBitcoinConnect(connector)) {
        return new BitcoinMessage({
          statement: 'Wellcome to deputy.network',
        });
      }

      return new SiweMessage({
        nonce,
        address,
        chainId,
        domain: 'deputy.network',
        statement: 'Wellcome to deputy.network',
        uri: 'https://deputy.network',
        version: '1',
      });
    },

    getMessageBody: ({ message }) => {
      return message.prepareMessage();
    },

    verify: async ({ message, signature }) => {
      console.log('step two api----------');
      await delay(1000);
      setStatus('authenticated');

      return true;
    },

    signOut: async () => {
      console.log('logout api----------');
      await delay(1000);
      setStatus('unauthenticated');
    },
  });

  // ----------------------------------------------------------------------------------

  return {
    authAdapter,
  };
}
