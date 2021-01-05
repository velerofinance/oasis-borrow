// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { LedgerConnector, MagicLinkConnector, TrezorConnector } from '@oasisdex/connectors'
import { ConnectionKind, getNetworkId, Web3Context } from '@oasisdex/web3-context'
import { UnsupportedChainIdError } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { useAppContext } from 'components/AppContextProvider'
import { dappName, networksById, pollingInterval } from 'components/blockchain/config'
import { LedgerAccountSelection } from 'components/connectWallet/LedgerAccountSelection'
import { TrezorAccountSelection } from 'components/connectWallet/TrezorAccountSelection'
import { AppSpinner } from 'helpers/loadingIndicator/LoadingIndicator'
import { useObservable } from 'helpers/observableHook'
import { WithChildren } from 'helpers/types'
import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'i18n'
import { mapValues } from 'lodash'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { combineLatest, identity, Observable } from 'rxjs'
import { first, tap } from 'rxjs/operators'
import { Alert, Box, Button, Flex, Grid, Heading, Text } from 'theme-ui'
import { assert } from 'ts-essentials'
import Web3 from 'web3'

import { getMagicLinkKey } from './magicLink'
import { MagicLinkForm } from './MagicLinkView'

export const AUTO_CONNECT = 'autoConnect'

interface AutoConnectLocalStorage {
  connectionKind: ConnectionKind
  magicLinkEmail?: string
}

const rpcUrls: { [chainId: number]: string } = mapValues(
  networksById,
  (network) => network.infuraUrl,
)

async function getConnector(connectorKind: ConnectionKind, network: number, options: any = {}) {
  assert(rpcUrls[network], 'Unsupported chainId!')
  switch (connectorKind) {
    case 'injected':
      const connector = new InjectedConnector({
        supportedChainIds: Object.values(networksById).map(({ id }) => Number.parseInt(id)),
      })
      const connectorChainId = Number.parseInt((await connector.getChainId()) as string)
      if (network !== connectorChainId) {
        alert('Browser ethereum provider and URL network param do not match!')
        throw new Error('Browser ethereum provider and URL network param do not match!')
      }
      return connector
    case 'walletLink':
      return new WalletLinkConnector({
        url: rpcUrls[network],
        appName: dappName,
      })
    case 'walletConnect':
      return new WalletConnectConnector({
        rpc: { [network]: rpcUrls[network] },
        bridge: 'https://bridge.walletconnect.org',
        qrcode: true,
        pollingInterval,
      })
    case 'trezor':
      return new TrezorConnector({
        chainId: network,
        url: rpcUrls[network],
        pollingInterval: pollingInterval,
        manifestEmail: 'dummy@abc.xyz',
        manifestAppUrl: 'http://localhost:1234',
        config: { networkId: network },
      })
    case 'ledger':
      return new LedgerConnector({
        ...options,
        chainId: network,
        url: rpcUrls[network],
        pollingInterval: pollingInterval,
      })
    case 'magicLink':
      return new MagicLinkConnector({
        ...options,
        apiKey: getMagicLinkKey(network),
        chainId: networksById[network].name,
      })
    case 'network':
      return new NetworkConnector({
        urls: { [network]: networksById[network].infuraUrl },
        defaultChainId: network,
      })
  }
}

interface SupportedWallet {
  iconName: string
  connectionKind: ConnectionKind
}

const SUPPORTED_WALLETS: SupportedWallet[] = [
  { iconName: 'metamask_color', connectionKind: 'injected' },
  { iconName: 'wallet_connect_color', connectionKind: 'walletConnect' },
  { iconName: 'coinbase_color', connectionKind: 'walletLink' },
  { iconName: 'trezor', connectionKind: 'trezor' },
  { iconName: 'ledger', connectionKind: 'ledger' },
]

function ConnectWalletButton({
  isConnecting,
  iconName,
  connect,
  description,
}: {
  isConnecting: boolean
  iconName: string
  description: string
  connect?: () => void
}) {
  return (
    <Button variant="outlineSquare" sx={{ textAlign: 'left' }} onClick={connect}>
      <Flex sx={{ alignItems: 'center' }}>
        <Flex sx={{ ml: 1, mr: 3, alignItems: 'center' }}>
          {isConnecting ? <AppSpinner size={22} /> : <Icon name={iconName} size={22} />}
        </Flex>
        {description}
      </Flex>
    </Button>
  )
}

function connect(
  web3Context: Web3Context | undefined,
  connectorKind: ConnectionKind,
  chainId: number,
  options: any = {},
) {
  return async () => {
    if (
      web3Context?.status === 'error' ||
      web3Context?.status === 'notConnected' ||
      web3Context?.status === 'connectedReadonly'
    ) {
      try {
        web3Context.connect(await getConnector(connectorKind, chainId, options), connectorKind)
      } catch (e) {
        console.log(e)
      }
    }
  }
}

export function getInjectedWalletKind() {
  const w = window as any

  if (w.imToken) return 'IMToken'

  if (!w.web3 || typeof w.web3.currentProvider === 'undefined') return undefined

  if (w.web3.currentProvider.isAlphaWallet) return 'Alpha Wallet'

  if (w.web3.currentProvider.isMetaMask) return 'MetaMask'

  if (w.web3.currentProvider.isTrust) return 'Trust'

  if (typeof w.SOFA !== 'undefined') return 'Coinbase'

  if (typeof w.__CIPHER__ !== 'undefined') return 'Coinbase'

  if (w.web3.currentProvider.constructor.name === 'EthereumProvider') return 'Mist'

  if (w.web3.currentProvider.constructor.name === 'Web3FrameProvider') return 'Parity'

  if (w.web3.currentProvider.host && w.web3.currentProvider.host.indexOf('infura') !== -1)
    return 'Infura'

  if (w.web3.currentProvider.host && w.web3.currentProvider.host.indexOf('localhost') !== -1)
    return 'Localhost'

  return 'Injected provider'
}

export function getConnectionKindMessage(connectionKind: ConnectionKind) {
  switch (connectionKind) {
    case 'injected':
      return getInjectedWalletKind()
    case 'walletConnect':
      return 'WalletConnect'
    case 'walletLink':
      return 'Coinbase wallet'
    case 'trezor':
      return 'Trezor'
    case 'ledger':
      return 'Ledger'
    case 'network':
      return 'Network'
    case 'magicLink':
      return 'Magic Link'
  }
}

export function ConnectWallet({ originalUrl }: { originalUrl?: string }) {
  const { web3Context$ } = useAppContext()
  const web3Context = useObservable(web3Context$)
  const { t } = useTranslation('common')
  const { replace } = useRedirect()
  const [connectingLedger, setConnectingLedger] = React.useState(false)

  useEffect(() => {
    const subscription = web3Context$.subscribe((web3Context) => {
      if (web3Context.status === 'connected') {
        const redirectUrl = originalUrl || '/dashboard'
        replace(`/[address]${redirectUrl}`, `/${web3Context.account}${redirectUrl}`)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!web3Context) {
    return null
  }

  if (connectingLedger) {
    return (
      <LedgerAccountSelection
        cancel={() => {
          setConnectingLedger(false)
          web3Context$
            .pipe(
              first(),
              tap((web3Context) => {
                if (
                  web3Context.status === 'connectingHWSelectAccount' ||
                  web3Context.status === 'error'
                ) {
                  web3Context.deactivate()
                }
              }),
            )
            .subscribe(identity)
        }}
        chainId={getNetworkId()}
        web3Context={web3Context}
      />
    )
  }

  if (
    (web3Context.status === 'connecting' || web3Context.status === 'connectingHWSelectAccount') &&
    web3Context.connectionKind === 'trezor'
  ) {
    return (
      <TrezorAccountSelection
        cancel={() => {
          web3Context$
            .pipe(
              first(),
              tap((web3Context) => {
                if (web3Context.status === 'connectingHWSelectAccount') {
                  web3Context.deactivate()
                }
              }),
            )
            .subscribe(identity)
        }}
        web3Context={web3Context}
      />
    )
  }

  if (web3Context.status === 'connecting' && web3Context.connectionKind === 'network') {
    return <Box>{t('readonly-user-connecting')}</Box>
  }

  return (
    <Grid
      gap={4}
      columns="1fr"
      sx={{
        textAlign: 'center',
        width: '100%',
      }}
    >
      <MagicLinkForm />
      <Flex
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '280px',
          width: '100%',
          my: 3,
          mx: 'auto',
        }}
      >
        <Box sx={{ flex: 1, height: '1px', bg: 'primaryAlt' }} />
        <Text sx={{ color: 'onSurface', mx: 3 }}>{t('or')}</Text>
        <Box sx={{ flex: 1, height: '1px', bg: 'primaryAlt' }} />
      </Flex>
      <Heading as="h1">{t('connect-wallet')}</Heading>
      {web3Context.status === 'error' &&
        ((web3Context.error instanceof UnsupportedChainIdError && (
          <Alert variant="error" sx={{ fontWeight: 'normal', borderRadius: 'large' }}>
            <Text sx={{ my: 1, ml: 2, fontSize: 3, lineHeight: 'body' }}>
              {t('metamask-unsupported-network')}
            </Text>
          </Alert>
        )) || (
          <Alert variant="error" sx={{ fontWeight: 'normal', borderRadius: 'large' }}>
            <Text sx={{ my: 1, ml: 2, fontSize: 3, lineHeight: 'body' }}>{t('connect-error')}</Text>
          </Alert>
        ))}
      <Grid columns={1} sx={{ maxWidth: '280px', width: '100%', mx: 'auto' }}>
        {SUPPORTED_WALLETS.map(({ iconName, connectionKind }) => {
          const isConnecting =
            web3Context.status === 'connecting' && web3Context.connectionKind === connectionKind
          const connectionKindMsg = getConnectionKindMessage(connectionKind)
          const descriptionTranslation = isConnecting ? 'connect-confirm' : 'connect-with'

          return (
            <ConnectWalletButton
              {...{
                key: connectionKind,
                isConnecting,
                iconName,
                description: t(descriptionTranslation, {
                  connectionKind: connectionKindMsg,
                }),
                connect:
                  web3Context.status === 'connecting'
                    ? undefined
                    : connectionKind === 'ledger'
                    ? () => setConnectingLedger(true)
                    : connect(web3Context, connectionKind, getNetworkId()),
              }}
            />
          )
        })}
      </Grid>
    </Grid>
  )
}

function autoConnect(
  web3Context$: Observable<Web3Context>,
  readOnlyAccount$: Observable<string | undefined>,
  defaultChainId: number,
) {
  let firstTime = true

  const subscription = combineLatest(web3Context$, readOnlyAccount$).subscribe(
    async ([web3Context, readOnlyAccount]) => {
      try {
        const serialized = localStorage.getItem(AUTO_CONNECT)
        if (firstTime && web3Context.status === 'notConnected' && serialized) {
          const { connectionKind, magicLinkEmail } = JSON.parse(
            serialized,
          ) as AutoConnectLocalStorage
          if (connectionKind !== 'ledger' && connectionKind !== 'trezor') {
            console.log('autoConnecting from localStorage', connectionKind, defaultChainId)
            const connector = await getConnector(connectionKind, defaultChainId, {
              email: magicLinkEmail,
            })
            web3Context.connect(connector, connectionKind)
          }
        } else if (web3Context.status === 'notConnected') {
          if (readOnlyAccount) {
            console.log('autoConnecting readonly', defaultChainId)
            web3Context.connect(await getConnector('network', defaultChainId), 'network')
          }
        }
        if (web3Context.status === 'connected') {
          localStorage.setItem(
            AUTO_CONNECT,
            JSON.stringify({
              connectionKind: web3Context.connectionKind,
              ...(web3Context.connectionKind === 'magicLink' && {
                magicLinkEmail: web3Context.magicLinkEmail,
              }),
            }),
          )
        } else {
          localStorage.removeItem(AUTO_CONNECT)
        }
      } catch (e) {
        if (web3Context.status === 'notConnected' && readOnlyAccount) {
          console.log('falling back to autoConnecting readonly', defaultChainId)
          web3Context.connect(await getConnector('network', defaultChainId), 'network')
        }
      } finally {
        firstTime = false
      }
    },
  )
  return () => {
    subscription.unsubscribe()
  }
}

export function WithConnection({ children }: WithChildren) {
  const router = useRouter()
  const { web3Context$, readonlyAccount$ } = useAppContext()
  const { address } = router.query as { address: string; network: string }
  const { push } = useRedirect()

  useEffect(() => {
    if (Web3.utils.isAddress(address)) {
      readonlyAccount$.next(address)
    } else {
      push('/dashboard')
    }
    return () => readonlyAccount$.next(undefined)
  }, [address])

  useEffect(() => autoConnect(web3Context$, readonlyAccount$, getNetworkId()), [])

  return children
}