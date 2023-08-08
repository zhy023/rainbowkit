import {
  createAuthenticationAdapter,
  AuthenticationStatus,
} from '@rainbow-me/rainbowkit';
import { SiweMessage } from 'siwe';
import { atom, useAtom } from 'jotai';

export const authAtom = atom<AuthenticationStatus>('unauthenticated');

export function useAuth() {
  const [auth, setAuth] = useAtom(authAtom);

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      // const response = await fetch('/api/nonce');
      // return await response.text();
      return '100';
    },
    createMessage: ({ nonce, address, chainId }) => {
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
      return message.prepareMessage();
    },
    verify: async ({ message, signature }) => {
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
