import {
  createAuthenticationAdapter,
  AuthenticationStatus,
} from '@rainbow-me/rainbowkit';
import { SiweMessage } from 'siwe';
import { atom, useAtom } from 'jotai';
import { Connector, useAccount } from 'wagmi';

export const authAtom = atom<AuthenticationStatus>('unauthenticated');

const temp = {
  address: '',
};

const isBitWallet = (conn: Connector) =>
  ['hiro', 'xverse', 'unisat'].includes(conn.id);

class BitMessage {
  message = '';

  constructor(message: string) {
    this.message = message;
  }

  toMessage(): string {
    return this.message;
  }
  prepareMessage(): string {
    return this.toMessage();
  }
}

export function useAuth() {
  const [auth, setAuth] = useAtom(authAtom);

  const { connector } = useAccount({
    onConnect(data: any) {
      if (!data.address) {
        return;
      }

      console.log(data.connector);

      if (isBitWallet(data.connector)) {
        temp.address = data.connector?.btcNetwork.address;
      } else {
        temp.address = data.address;
      }
    },
  });

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      console.log('1');
      // const response = await fetch('/api/nonce');
      // return await response.text();
      return '100';
    },
    createMessage: ({ nonce, address, chainId }) => {
      console.log('2');
      if (isBitWallet(connector)) {
        return new BitMessage('test');
      }

      return new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in with Ethereum to the app.',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      });
    },
    getMessageBody: ({ message }) => {
      console.log('3');
      return message.prepareMessage();
    },
    verify: async ({ message, signature }) => {
      console.log(message);
      // const verifyRes = await fetch('/api/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message, signature }),
      // });
      setAuth('authenticated');
      return true;
    },
    signOut: async () => {
      // await fetch('/api/logout');
      setAuth('unauthenticated');
    },
  });

  return { authenticationAdapter };
}
