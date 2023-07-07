import { SiweMessage } from 'siwe';
import { useAccount } from 'wagmi';
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

const getApiData = async () => {
  const response = await fetch(
    'https://jsonplaceholder.typicode.com/todos'
  ).then(response => response.json());

  return response;
};

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
      console.log('step one api----------');
      const v = await getApiData();
      console.log(v);
      return '100';
    },

    createMessage: ({ nonce, address, chainId }) => {
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
      if ((connector as any)?.walletType === 'xverse') {
        return 'Wellcome to deputy.network';
      }

      if ((connector as any)?.walletType === 'hiro') {
        return 'Wellcome to deputy.network';
      }

      if ((connector as any)?.walletType === 'unisat') {
        return 'Wellcome to deputy.network';
      }

      return message.prepareMessage();
    },

    verify: async ({ message, signature }) => {
      console.log('step two api----------');
      const v = await getApiData();
      console.log(v);
      setStatus('authenticated');

      return true;
    },

    signOut: async () => {
      console.log('logout api----------');
      const v = await getApiData();
      console.log(v);
      setStatus('unauthenticated');
    },
  });

  // ----------------------------------------------------------------------------------

  return {
    authAdapter,
  };
}
