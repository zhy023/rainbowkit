import React, { useCallback, useContext, useState } from 'react';
import { touchableStyles } from '../../css/touchableStyles';
import { isIOS } from '../../utils/isMobile';
import {
  useWalletConnectors,
  WalletConnector,
} from '../../wallets/useWalletConnectors';
import { AsyncImage } from '../AsyncImage/AsyncImage';
import { Box } from '../Box/Box';
import { ActionButton } from '../Button/ActionButton';
import { CloseButton } from '../CloseButton/CloseButton';
import { DisclaimerLink } from '../Disclaimer/DisclaimerLink';
import { DisclaimerText } from '../Disclaimer/DisclaimerText';
import { BackIcon } from '../Icons/Back';
import { AppContext } from '../RainbowKitProvider/AppContext';
import { useCoolMode } from '../RainbowKitProvider/useCoolMode';
import { setWalletConnectDeepLink } from '../RainbowKitProvider/walletConnectDeepLink';
import { Text } from '../Text/Text';
import * as styles from './MobileOptions.css';

const deepLink = {
  coinbase:
    'https://go.cb-w.com/dapp?cb_url=https://demo.deputy.network?only=coinbase',
  metaMask: 'https://metamask.app.link/dapp/demo.deputy.network?only=metaMask',
  tokenPocket:
    'tpdapp://open?params={"url": "https://demo.deputy.network?only=tokenPocket"}',
  trust:
    'https://link.trustwallet.com/open_url?coin_id=60&url=https://demo.deputy.network?only=trust',
};

function WalletButton({
  onClose,
  wallet,
}: {
  wallet: WalletConnector;
  onClose: () => void;
}) {
  const {
    connect,
    connector,
    iconBackground,
    iconUrl,
    id,
    mobile,
    name,
    onConnecting,
    ready,
    shortName,
  } = wallet;
  const getMobileUri = mobile?.getUri;
  const coolModeRef = useCoolMode(iconUrl);
  // -----------------------------------------------

  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  const ov = params.get('only');
  // @ts-ignore
  const deepUrl = deepLink[connector.id];

  if (ov !== connector.id && deepUrl) {
    return (
      <a href={deepUrl}>
        <Box
          as="button"
          color={ready ? 'modalText' : 'modalTextSecondary'}
          disabled={!ready}
          fontFamily="body"
          key={id}
          ref={coolModeRef}
          style={{ overflow: 'visible', textAlign: 'center' }}
          testId={`wallet-option-${id}`}
          type="button"
          width="full"
        >
          <Box
            alignItems="center"
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <Box paddingBottom="8" paddingTop="10">
              <AsyncImage
                background={iconBackground}
                borderRadius="13"
                boxShadow="walletLogo"
                height="60"
                src={iconUrl}
                width="60"
              />
            </Box>
            <Box display="flex" flexDirection="column" textAlign="center">
              <Text
                as="h2"
                color={wallet.ready ? 'modalText' : 'modalTextSecondary'}
                size="13"
                weight="medium"
              >
                <Box as="span" position="relative">
                  {shortName ?? name}
                  {!wallet.ready && ' (unsupported)'}
                </Box>
              </Text>

              {wallet.recent && (
                <Text color="accentColor" size="12" weight="medium">
                  Recent
                </Text>
              )}
            </Box>
          </Box>
        </Box>
      </a>
    );
  }

  return (
    <Box
      as="button"
      color={ready ? 'modalText' : 'modalTextSecondary'}
      disabled={!ready}
      fontFamily="body"
      key={id}
      // eslint-disable-next-line react-hooks/rules-of-hooks
      onClick={useCallback(async () => {
        if (id === 'walletConnect') onClose?.();

        connect?.();

        // We need to guard against "onConnecting" callbacks being fired
        // multiple times since connector instances can be shared between
        // wallets. Ideally wagmi would let us scope the callback to the
        // specific "connect" call, but this will work in the meantime.
        let callbackFired = false;

        onConnecting?.(async () => {
          if (callbackFired) return;
          callbackFired = true;

          if (getMobileUri) {
            const mobileUri = await getMobileUri();
            alert(mobileUri);

            if (
              connector.id === 'walletConnect' ||
              connector.id === 'walletConnectLegacy'
            ) {
              // In Web3Modal, an equivalent setWalletConnectDeepLink routine gets called after
              // successful connection and then the universal provider uses it on requests. We call
              // it upon onConnecting; this now needs to be called for both v1 and v2 Wagmi connectors.
              // The `connector` type refers to Wagmi connectors, as opposed to RainbowKit wallet connectors.
              // https://github.com/WalletConnect/web3modal/blob/27f2b1fa2509130c5548061816c42d4596156e81/packages/core/src/utils/CoreUtil.ts#L72
              setWalletConnectDeepLink({ mobileUri, name });
            }

            if (mobileUri.startsWith('http')) {
              // Workaround for https://github.com/rainbow-me/rainbowkit/issues/524.
              // Using 'window.open' causes issues on iOS in non-Safari browsers and
              // WebViews where a blank tab is left behind after connecting.
              // This is especially bad in some WebView scenarios (e.g. following a
              // link from Twitter) where the user doesn't have any mechanism for
              // closing the blank tab.
              // For whatever reason, links with a target of "_blank" don't suffer
              // from this problem, and programmatically clicking a detached link
              // element with the same attributes also avoids the issue.
              const link = document.createElement('a');
              link.href = mobileUri;
              link.target = '_blank';
              link.rel = 'noreferrer noopener';
              link.click();
            } else {
              window.location.href = mobileUri;
            }
          }
        });
      }, [connector, connect, getMobileUri, onConnecting, onClose, name, id])}
      ref={coolModeRef}
      style={{ overflow: 'visible', textAlign: 'center' }}
      testId={`wallet-option-${id}`}
      type="button"
      width="full"
    >
      <Box
        alignItems="center"
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <Box paddingBottom="8" paddingTop="10">
          <AsyncImage
            background={iconBackground}
            borderRadius="13"
            boxShadow="walletLogo"
            height="60"
            src={iconUrl}
            width="60"
          />
        </Box>
        <Box display="flex" flexDirection="column" textAlign="center">
          <Text
            as="h2"
            color={wallet.ready ? 'modalText' : 'modalTextSecondary'}
            size="13"
            weight="medium"
          >
            {/* Fix button text clipping in Safari: https://stackoverflow.com/questions/41100273/overflowing-button-text-is-being-clipped-in-safari */}
            <Box as="span" position="relative">
              {shortName ?? name}
              {!wallet.ready && ' (unsupported)'}
            </Box>
          </Text>

          {wallet.recent && (
            <Text color="accentColor" size="12" weight="medium">
              Recent
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}

enum MobileWalletStep {
  Connect = 'CONNECT',
  Get = 'GET',
}

export function MobileOptions({ onClose }: { onClose: () => void }) {
  const titleId = 'rk_connect_title';
  const wallets = useWalletConnectors();
  const { disclaimer: Disclaimer, learnMoreUrl } = useContext(AppContext);

  let headerLabel = null;
  let walletContent = null;
  let headerBackgroundContrast = false;
  let headerBackButtonLink: MobileWalletStep | null = null;

  const [walletStep, setWalletStep] = useState<MobileWalletStep>(
    MobileWalletStep.Connect
  );

  const ios = isIOS();

  switch (walletStep) {
    case MobileWalletStep.Connect: {
      headerLabel = 'Connect a Wallet';
      headerBackgroundContrast = true;
      walletContent = (
        <Box>
          <Box
            background="profileForeground"
            className={styles.scroll}
            display="flex"
            paddingBottom="20"
            paddingTop="6"
          >
            <Box display="flex" style={{ margin: '0 auto' }}>
              {wallets
                .filter(wallet => wallet.ready)
                .map(wallet => {
                  return (
                    <Box key={wallet.id} paddingX="20">
                      <Box width="60">
                        <WalletButton onClose={onClose} wallet={wallet} />
                      </Box>
                    </Box>
                  );
                })}
            </Box>
          </Box>

          <Box
            background="generalBorder"
            height="1"
            marginBottom="32"
            marginTop="-1"
          />

          <Box
            alignItems="center"
            display="flex"
            flexDirection="column"
            gap="32"
            paddingX="32"
            style={{ textAlign: 'center' }}
          >
            <Box
              display="flex"
              flexDirection="column"
              gap="8"
              textAlign="center"
            >
              <Text color="modalText" size="16" weight="bold">
                What is a Wallet?
              </Text>
              <Text color="modalTextSecondary" size="16">
                A wallet is used to send, receive, store, and display digital
                assets. It&rsquo;s also a new way to log in, without needing to
                create new accounts and passwords on&nbsp;every&nbsp;website.
              </Text>
            </Box>
          </Box>

          <Box paddingTop="32" paddingX="20">
            <Box display="flex" gap="14" justifyContent="center">
              <ActionButton
                label="Get a Wallet"
                onClick={() => setWalletStep(MobileWalletStep.Get)}
                size="large"
                type="secondary"
              />
              <ActionButton
                href={learnMoreUrl}
                label="Learn More"
                size="large"
                type="secondary"
              />
            </Box>
          </Box>
          {Disclaimer && (
            <Box marginTop="28" marginX="32" textAlign="center">
              <Disclaimer Link={DisclaimerLink} Text={DisclaimerText} />
            </Box>
          )}
        </Box>
      );
      break;
    }
    case MobileWalletStep.Get: {
      headerLabel = 'Get a Wallet';
      headerBackButtonLink = MobileWalletStep.Connect;

      const mobileWallets = wallets
        ?.filter(
          wallet =>
            wallet.downloadUrls?.ios ||
            wallet.downloadUrls?.android ||
            wallet.downloadUrls?.mobile
        )
        ?.splice(0, 3);

      walletContent = (
        <Box>
          <Box
            alignItems="center"
            display="flex"
            flexDirection="column"
            height="full"
            marginBottom="36"
            marginTop="5"
            paddingTop="12"
            width="full"
          >
            {mobileWallets.map((wallet, index) => {
              const { downloadUrls, iconBackground, iconUrl, name } = wallet;

              if (
                !downloadUrls?.ios &&
                !downloadUrls?.android &&
                !downloadUrls?.mobile
              ) {
                return null;
              }

              return (
                <Box
                  display="flex"
                  gap="16"
                  key={wallet.id}
                  paddingX="20"
                  width="full"
                >
                  <Box style={{ minHeight: 48, minWidth: 48 }}>
                    <AsyncImage
                      background={iconBackground}
                      borderColor="generalBorder"
                      borderRadius="10"
                      height="48"
                      src={iconUrl}
                      width="48"
                    />
                  </Box>
                  <Box display="flex" flexDirection="column" width="full">
                    <Box alignItems="center" display="flex" height="48">
                      <Box width="full">
                        <Text color="modalText" size="18" weight="bold">
                          {name}
                        </Text>
                      </Box>
                      <ActionButton
                        href={
                          (ios ? downloadUrls?.ios : downloadUrls?.android) ||
                          downloadUrls?.mobile
                        }
                        label="GET"
                        size="small"
                        type="secondary"
                      />
                    </Box>
                    {index < mobileWallets.length - 1 && (
                      <Box
                        background="generalBorderDim"
                        height="1"
                        marginY="10"
                        width="full"
                      />
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
          {/* spacer */}
          <Box style={{ marginBottom: '42px' }} />
          <Box
            alignItems="center"
            display="flex"
            flexDirection="column"
            gap="36"
            paddingX="36"
            style={{ textAlign: 'center' }}
          >
            <Box
              display="flex"
              flexDirection="column"
              gap="12"
              textAlign="center"
            >
              <Text color="modalText" size="16" weight="bold">
                Not what you&rsquo;re looking for?
              </Text>
              <Text color="modalTextSecondary" size="16">
                Select a wallet on the main screen to get started with a
                different wallet provider.
              </Text>
            </Box>
          </Box>
        </Box>
      );
      break;
    }
  }

  return (
    <Box display="flex" flexDirection="column" paddingBottom="36">
      {/* header section */}
      <Box
        background={
          headerBackgroundContrast ? 'profileForeground' : 'modalBackground'
        }
        display="flex"
        flexDirection="column"
        paddingBottom="4"
        paddingTop="14"
      >
        <Box
          display="flex"
          justifyContent="center"
          paddingBottom="6"
          paddingX="20"
          position="relative"
        >
          {headerBackButtonLink && (
            <Box
              display="flex"
              position="absolute"
              style={{
                left: 0,
                marginBottom: -20,
                marginTop: -20,
              }}
            >
              <Box
                alignItems="center"
                as="button"
                className={touchableStyles({
                  active: 'shrinkSm',
                  hover: 'growLg',
                })}
                color="accentColor"
                display="flex"
                marginLeft="4"
                marginTop="20"
                onClick={() => setWalletStep(headerBackButtonLink!)}
                padding="16"
                style={{ height: 17, willChange: 'transform' }}
                transition="default"
                type="button"
              >
                <BackIcon />
              </Box>
            </Box>
          )}

          <Box marginTop="4" textAlign="center" width="full">
            <Text
              as="h1"
              color="modalText"
              id={titleId}
              size="20"
              weight="bold"
            >
              {headerLabel}
            </Text>
          </Box>

          <Box
            alignItems="center"
            display="flex"
            height="32"
            paddingRight="14"
            position="absolute"
            right="0"
          >
            <Box
              style={{ marginBottom: -20, marginTop: -20 }} // Vertical bleed
            >
              <CloseButton onClose={onClose} />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        {walletContent}
      </Box>
    </Box>
  );
}
