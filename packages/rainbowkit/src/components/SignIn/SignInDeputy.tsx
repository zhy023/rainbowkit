import React, { useCallback, useRef } from 'react';
import { signMessage } from 'sats-connect';
import { UserRejectedRequestError } from 'viem';
import { useAccount, useDisconnect, useNetwork, useSignMessage } from 'wagmi';
import { touchableStyles } from '../../css/touchableStyles';
import { isMobile } from '../../utils/isMobile';
import { AsyncImage } from '../AsyncImage/AsyncImage';
import { Box } from '../Box/Box';
import { ActionButton } from '../Button/ActionButton';
import { CloseButton } from '../CloseButton/CloseButton';
import { useAuthenticationAdapter } from '../RainbowKitProvider/AuthenticationContext';
import { Text } from '../Text/Text';

export const signInIcon = async () => (await import('./signature.svg')).default;

export function SignIn({ onClose }: { onClose: () => void }) {
  const [{ status, ...state }, setState] = React.useState<{
    status: 'idle' | 'signing' | 'verifying';
    errorMessage?: string;
    nonce?: string;
  }>({ status: 'idle' });

  const authAdapter = useAuthenticationAdapter();

  const getNonce = useCallback(async () => {
    try {
      const nonce = await authAdapter.getNonce();
      setState(x => ({ ...x, nonce }));
    } catch (error) {
      setState(x => ({
        ...x,
        errorMessage: 'Error preparing message, please retry!',
        status: 'idle',
      }));
    }
  }, [authAdapter]);

  // Pre-fetch nonce when screen is rendered
  // to ensure deep linking works for WalletConnect
  // users on iOS when signing the SIWE message
  const onceRef = useRef(false);
  React.useEffect(() => {
    if (onceRef.current) return;
    onceRef.current = true;

    getNonce();
  }, [getNonce]);

  const mobile = isMobile();
  const { address, connector } = useAccount();
  const { chain: activeChain } = useNetwork();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const cancel = () => disconnect();

  // ----------------------------------------------------------------------------------

  const signIn = async () => {
    try {
      const chainId = activeChain?.id;
      const { nonce } = state;

      if (!address || !chainId || !nonce) {
        return;
      }

      setState(x => ({
        ...x,
        errorMessage: undefined,
        status: 'signing',
      }));

      const message = authAdapter.createMessage({ address, chainId, nonce });
      let signature: string;

      try {
        signature = await signMessageAsync({
          message: authAdapter.getMessageBody({ message }),
        });
      } catch (error) {
        if (error instanceof UserRejectedRequestError) {
          // It's not really an "error" so we silently ignore and reset to idle state
          return setState(x => ({
            ...x,
            status: 'idle',
          }));
        }

        return setState(x => ({
          ...x,
          errorMessage: 'Error signing message, please retry!',
          status: 'idle',
        }));
      }

      setState(x => ({ ...x, status: 'verifying' }));

      try {
        const verified = await authAdapter.verify({ message, signature });

        if (verified) {
          return;
        } else {
          throw new Error();
        }
      } catch (error) {
        return setState(x => ({
          ...x,
          errorMessage: 'Error verifying signature, please retry!',
          status: 'idle',
        }));
      }
    } catch (error) {
      setState({
        errorMessage: 'Oops, something went wrong!',
        status: 'idle',
      });
    }
  };

  // ----------------------------------------------------------------------------------

  const signXverse = async () =>
    new Promise(async (resole, reject) => {
      const chainId = activeChain?.id;
      const { nonce } = state;

      if (!address || !chainId || !nonce) {
        return;
      }

      try {
        setState(x => ({
          ...x,
          errorMessage: undefined,
          status: 'signing',
        }));

        const message = authAdapter.createMessage({
          address,
          chainId,
          nonce,
        });
        const signMsg = message.getMessageBody({ message: '' });
        const signMessageOptions = {
          onCancel: () => {
            setState(x => ({
              ...x,
              status: 'idle',
            }));
            reject();
          },
          onFinish: async (signature: string) => {
            try {
              const verified = await authAdapter.verify({
                message: signMsg,
                signature,
              });

              if (verified) {
                resole(verified);
                return;
              } else {
                throw new Error();
              }
            } catch (error) {
              setState(x => ({
                ...x,
                errorMessage: 'Error verifying signature, please retry!',
                status: 'idle',
              }));
              reject();
            }
          },
          payload: {
            address: connector.btnNetwork.address,
            message,
            network: connector.btnNetwork,
          },
        };

        setState(x => ({ ...x, status: 'verifying' }));
        await signMessage(signMessageOptions);
      } catch (error) {
        setState(x => ({
          ...x,
          errorMessage: 'Error signing message, please retry!',
          status: 'idle',
        }));
      }
    });

  // ----------------------------------------------------------------------------------

  const signHiro = async () =>
    new Promise(async (resolve, reject) => {
      const chainId = activeChain?.id;
      const { nonce } = state;

      if (!address || !chainId || !nonce) {
        return;
      }

      try {
        setState(x => ({
          ...x,
          errorMessage: undefined,
          status: 'signing',
        }));

        const message = authAdapter.createMessage({
          address,
          chainId,
          nonce,
        });

        const signMsg = authAdapter.getMessageBody({ message });

        // @ts-ignore
        if (!window.btc) {
          setState(x => ({
            ...x,
            errorMessage: 'Error verifying signature, please retry!',
            status: 'idle',
          }));
          reject();
        }

        setState(x => ({ ...x, status: 'verifying' }));

        // @ts-ignore
        const { result } = await window.btc?.request('signMessage', {
          message: signMsg,
          paymentType: 'p2tr', // or 'p2wphk' (default)
        });

        const verified = await authAdapter.verify({
          message,
          signature: result.signature,
        });

        resolve(verified);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        setState(x => ({
          ...x,
          errorMessage: 'Error signing message, please retry!',
          status: 'idle',
        }));
      }
    });

  // ----------------------------------------------------------------------------------

  const signUnisat = async () =>
    new Promise(async (resolve, reject) => {
      const chainId = activeChain?.id;
      const { nonce } = state;

      if (!address || !chainId || !nonce) {
        return;
      }

      try {
        setState(x => ({
          ...x,
          errorMessage: undefined,
          status: 'signing',
        }));

        const message = authAdapter.createMessage({
          address,
          chainId,
          nonce,
        });

        const signMsg = authAdapter.getMessageBody({ message });

        // @ts-ignore
        if (!window.btc) {
          setState(x => ({
            ...x,
            errorMessage: 'Error verifying signature, please retry!',
            status: 'idle',
          }));
          reject();
        }

        setState(x => ({ ...x, status: 'verifying' }));

        // @ts-ignore
        const signature = await window.unisat?.signMessage(signMsg);
        const verified = await authAdapter.verify({
          message,
          signature,
        });

        resolve(verified);
      } catch (error) {
        setState(x => ({
          ...x,
          errorMessage: 'Error signing message, please retry!',
          status: 'idle',
        }));
      }
    });

  // ----------------------------------------------------------------------------------

  async function signFacrey() {
    // bitcoin
    if (connector?.walletType) {
      // xverse
      if (connector.walletType === 'xverse') {
        await signXverse();
      }

      // hiro
      if (connector.walletType === 'hiro') {
        await signHiro();
      }

      // unisat
      if (connector.walletType === 'unisat') {
        await signUnisat();
      }

      return;
    }

    await signIn();
  }

  // ----------------------------------------------------------------------------------

  return (
    <Box position="relative">
      <Box
        display="flex"
        paddingRight="16"
        paddingTop="16"
        position="absolute"
        right="0"
      >
        <CloseButton onClose={onClose} />
      </Box>
      <Box
        alignItems="center"
        display="flex"
        flexDirection="column"
        gap={mobile ? '32' : '24'}
        padding="24"
        paddingX="18"
        style={{ paddingTop: mobile ? '60px' : '36px' }}
      >
        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          gap={mobile ? '6' : '4'}
          style={{ maxWidth: mobile ? 320 : 280 }}
        >
          <Box
            alignItems="center"
            display="flex"
            flexDirection="column"
            gap={mobile ? '32' : '16'}
          >
            <AsyncImage height={40} src={signInIcon} width={40} />
            <Text
              color="modalText"
              size={mobile ? '20' : '18'}
              textAlign="center"
              weight="heavy"
            >
              Sign Wallet Signature
            </Text>
          </Box>
          <Box
            alignItems="center"
            display="flex"
            flexDirection="column"
            gap={mobile ? '16' : '12'}
          >
            <Text
              color="modalTextSecondary"
              size={mobile ? '16' : '14'}
              textAlign="center"
            >
              We need a signature in order to verify your identity. This won’t
              cost any gas.
            </Text>
            {status === 'idle' && state.errorMessage ? (
              <Text
                color="error"
                size={mobile ? '16' : '14'}
                textAlign="center"
                weight="bold"
              >
                {state.errorMessage}
              </Text>
            ) : null}
          </Box>
        </Box>

        <Box
          alignItems={!mobile ? 'center' : undefined}
          display="flex"
          flexDirection="column"
          gap="8"
          width="full"
        >
          <ActionButton
            disabled={
              !state.nonce || status === 'signing' || status === 'verifying'
            }
            label={
              !state.nonce
                ? 'Preparing message...'
                : status === 'signing'
                ? 'Waiting for signature...'
                : status === 'verifying'
                ? 'Verifying signature...'
                : 'Sign the message'
            }
            onClick={signFacrey}
            size={mobile ? 'large' : 'medium'}
            testId="auth-message-button"
          />
          {mobile ? (
            <ActionButton
              label="Cancel"
              onClick={cancel}
              size="large"
              type="secondary"
            />
          ) : (
            <Box
              as="button"
              borderRadius="full"
              className={touchableStyles({ active: 'shrink', hover: 'grow' })}
              display="block"
              onClick={cancel}
              paddingX="10"
              paddingY="5"
              rel="noreferrer"
              style={{ willChange: 'transform' }}
              target="_blank"
              transition="default"
            >
              <Text
                color="closeButton"
                size={mobile ? '16' : '14'}
                weight="bold"
              >
                Cancel
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
