import { ContractDesc } from '@oasisdex/web3-context'
import { keyBy } from 'lodash'
import getConfig from 'next/config'
import { Dictionary } from 'ts-essentials'

import * as dsProxyFactory from './abi/ds-proxy-factory.json'
import * as dsProxyRegistry from './abi/ds-proxy-registry.json'
import * as vlx from './abi/ds-vlx-token.json'
import * as dssCdpManager from './abi/dss-cdp-manager.json'
import * as dssProxyActionsDsr from './abi/dss-proxy-actions-dsr.json'
import * as dssProxyActions from './abi/dss-proxy-actions.json'
import * as erc20 from './abi/erc20.json'
import * as getCdps from './abi/get-cdps.json'
import * as otc from './abi/matching-market.json'
import * as mcdDog from './abi/mcd-dog.json'
import * as mcdEnd from './abi/mcd-end.json'
import * as mcdJoinUsdv from './abi/mcd-join-usdv.json'
import * as mcdJug from './abi/mcd-jug.json'
import * as mcdPot from './abi/mcd-pot.json'
import * as mcdSpot from './abi/mcd-spot.json'
import * as otcSupport from './abi/otc-support-methods.json'
import * as vat from './abi/vat.json'
import {
  getCollateralJoinContracts,
  getCollaterals,
  getCollateralTokens,
  getOsms,
} from './addresses/addressesUtils'
import { default as kovanAddresses } from './addresses/kovan.json'
import { default as mainnetAddresses } from './addresses/mainnet.json'
import { default as velasAddresses } from './addresses/velas.json'
import { default as velastestnetAddresses } from './addresses/velastestnet.json'

export function contractDesc(abi: any, address: string): ContractDesc {
  return { abi, address }
}

const infuraProjectId =
  process.env.INFURA_PROJECT_ID || getConfig()?.publicRuntimeConfig?.infuraProjectId || ''
const etherscanAPIKey =
  process.env.ETHERSCAN_API_KEY || getConfig()?.publicRuntimeConfig?.etherscan || ''

const protoMain = {
  id: '1',
  name: 'main',
  label: 'Mainnet',
  infuraUrl: `https://mainnet.infura.io/v3/${infuraProjectId}`,
  infuraUrlWS: `wss://mainnet.infura.io/ws/v3/${infuraProjectId}`,
  safeConfirmations: 10,
  otc: contractDesc(otc, '0x794e6e91555438aFc3ccF1c5076A74F42133d08D'),
  collaterals: getCollaterals(mainnetAddresses),
  tokens: {
    ...getCollateralTokens(mainnetAddresses),
    WVLX: contractDesc(vlx, mainnetAddresses['VLX']),
    USDV: contractDesc(erc20, mainnetAddresses['MCD_USDV']),
    VDGT: contractDesc(erc20, mainnetAddresses.MCD_GOV),
    CHAI: contractDesc(erc20, '0x06af07097c9eeb7fd685c692751d5c66db49c215'),
    // WBTC: contractDesc(erc20, '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'),
  } as Dictionary<ContractDesc>,
  joins: {
    ...getCollateralJoinContracts(mainnetAddresses),
  },
  getCdps: contractDesc(getCdps, mainnetAddresses.GET_CDPS),
  mcdOsms: getOsms(mainnetAddresses),
  mcdJug: contractDesc(mcdJug, mainnetAddresses.MCD_JUG),
  mcdPot: contractDesc(mcdPot, mainnetAddresses.MCD_POT),
  mcdEnd: contractDesc(mcdEnd, mainnetAddresses.MCD_END),
  mcdSpot: contractDesc(mcdSpot, mainnetAddresses.MCD_SPOT),
  mcdDog: contractDesc(mcdDog, mainnetAddresses.MCD_DOG),
  dssCdpManager: contractDesc(dssCdpManager, mainnetAddresses.CDP_MANAGER),
  otcSupportMethods: contractDesc(otcSupport, '0x9b3f075b12513afe56ca2ed838613b7395f57839'),
  vat: contractDesc(vat, mainnetAddresses.MCD_VAT),
  mcdJoinUsdv: contractDesc(mcdJoinUsdv, mainnetAddresses.MCD_JOIN_USDV),
  dsProxyRegistry: contractDesc(dsProxyRegistry, mainnetAddresses.PROXY_REGISTRY),
  dsProxyFactory: contractDesc(dsProxyFactory, mainnetAddresses.PROXY_FACTORY),
  dssProxyActions: contractDesc(dssProxyActions, mainnetAddresses.PROXY_ACTIONS),
  etherscan: {
    url: 'https://etherscan.io',
    apiUrl: 'https://api.etherscan.io/api',
    apiKey: etherscanAPIKey || '',
  },
  taxProxyRegistries: ['0xaa63c8683647ef91b3fdab4b4989ee9588da297b'],
  dssProxyActionsDsr: contractDesc(
    dssProxyActionsDsr,
    '0x07ee93aEEa0a36FfF2A9B95dd22Bd6049EE54f26',
  ),
  magicLink: {
    apiKey: '',
  },
  cacheApi: 'https://oazo-bcache.new.oasis.app/api/v1',
}

const protoVelas = {
  id: '106',
  name: 'velas',
  label: 'Velas',
  infuraUrl: `https://evmexplorer.velas.com/rpc`,
  infuraUrlWS: `wss://api.velas.com`,
  safeConfirmations: 10,
  otc: contractDesc(otc, '0x794e6e91555438aFc3ccF1c5076A74F42133d08D'),
  collaterals: getCollaterals(velasAddresses),
  tokens: {
    ...getCollateralTokens(velasAddresses),
    WVLX: contractDesc(vlx, velasAddresses['VLX']),
    USDV: contractDesc(erc20, velasAddresses['MCD_USDV']),
    VDGT: contractDesc(erc20, velasAddresses.MCD_GOV),
    CHAI: contractDesc(erc20, '0x06af07097c9eeb7fd685c692751d5c66db49c215'),
    // WBTC: contractDesc(erc20, velasAddresses.WBTC),
    // WAG_VLXVDGT: contractDesc(erc20, velasAddresses.WAG_VLXVDGT),
  } as Dictionary<ContractDesc>,
  joins: {
    ...getCollateralJoinContracts(velasAddresses),
  },
  getCdps: contractDesc(getCdps, velasAddresses.GET_CDPS),
  mcdOsms: getOsms(velasAddresses),
  mcdJug: contractDesc(mcdJug, velasAddresses.MCD_JUG),
  mcdPot: contractDesc(mcdPot, velasAddresses.MCD_POT),
  mcdEnd: contractDesc(mcdEnd, velasAddresses.MCD_END),
  mcdSpot: contractDesc(mcdSpot, velasAddresses.MCD_SPOT),
  mcdDog: contractDesc(mcdDog, velasAddresses.MCD_DOG),
  dssCdpManager: contractDesc(dssCdpManager, velasAddresses.CDP_MANAGER),
  otcSupportMethods: contractDesc(otcSupport, '0x9b3f075b12513afe56ca2ed838613b7395f57839'),
  vat: contractDesc(vat, velasAddresses.MCD_VAT),
  mcdJoinUsdv: contractDesc(mcdJoinUsdv, velasAddresses.MCD_JOIN_USDV),
  dsProxyRegistry: contractDesc(dsProxyRegistry, velasAddresses.PROXY_REGISTRY),
  dsProxyFactory: contractDesc(dsProxyFactory, velasAddresses.PROXY_FACTORY),
  dssProxyActions: contractDesc(dssProxyActions, velasAddresses.PROXY_ACTIONS),
  etherscan: {
    url: 'https://evmexplorer.velas.com',
    apiUrl: 'https://api.etherscan.io/api',
    apiKey: etherscanAPIKey || '',
  },
  taxProxyRegistries: ['0xaa63c8683647ef91b3fdab4b4989ee9588da297b'],
  dssProxyActionsDsr: contractDesc(
    dssProxyActionsDsr,
    '0x07ee93aEEa0a36FfF2A9B95dd22Bd6049EE54f26',
  ),
  magicLink: {
    apiKey: '',
  },
  cacheApi: '',
}

const protoVelasTestnet = {
  id: '111',
  name: 'velastestnet',
  label: 'VelasTestnet',
  infuraUrl: `https://evmexplorer.testnet.velas.com/rpc`,
  infuraUrlWS: `wss://api.testnet.velas.com/`,
  safeConfirmations: 10,
  otc: contractDesc(otc, '0x794e6e91555438aFc3ccF1c5076A74F42133d08D'),
  collaterals: getCollaterals(velastestnetAddresses),
  tokens: {
    ...getCollateralTokens(velastestnetAddresses),
    WVLX: contractDesc(vlx, velastestnetAddresses['VLX']),
    USDV: contractDesc(erc20, velastestnetAddresses['MCD_USDV']),
    VDGT: contractDesc(erc20, velastestnetAddresses.MCD_GOV),
    CHAI: contractDesc(erc20, '0x06af07097c9eeb7fd685c692751d5c66db49c215'),
    // WBTC: contractDesc(erc20, velastestnetAddresses.WBTC),
  } as Dictionary<ContractDesc>,
  joins: {
    ...getCollateralJoinContracts(velastestnetAddresses),
  },
  getCdps: contractDesc(getCdps, velastestnetAddresses.GET_CDPS),
  mcdOsms: getOsms(velastestnetAddresses),
  mcdJug: contractDesc(mcdJug, velastestnetAddresses.MCD_JUG),
  mcdPot: contractDesc(mcdPot, velastestnetAddresses.MCD_POT),
  mcdEnd: contractDesc(mcdEnd, velastestnetAddresses.MCD_END),
  mcdSpot: contractDesc(mcdSpot, velastestnetAddresses.MCD_SPOT),
  mcdDog: contractDesc(mcdDog, velastestnetAddresses.MCD_DOG),
  dssCdpManager: contractDesc(dssCdpManager, velastestnetAddresses.CDP_MANAGER),
  otcSupportMethods: contractDesc(otcSupport, '0x9b3f075b12513afe56ca2ed838613b7395f57839'),
  vat: contractDesc(vat, velastestnetAddresses.MCD_VAT),
  mcdJoinUsdv: contractDesc(mcdJoinUsdv, velastestnetAddresses.MCD_JOIN_USDV),
  dsProxyRegistry: contractDesc(dsProxyRegistry, velastestnetAddresses.PROXY_REGISTRY),
  dsProxyFactory: contractDesc(dsProxyFactory, velastestnetAddresses.PROXY_FACTORY),
  dssProxyActions: contractDesc(dssProxyActions, velastestnetAddresses.PROXY_ACTIONS),
  etherscan: {
    url: 'https://evmexplorer.testnet.velas.com',
    apiUrl: 'https://api.etherscan.io/api',
    apiKey: etherscanAPIKey || '',
  },
  taxProxyRegistries: ['0xaa63c8683647ef91b3fdab4b4989ee9588da297b'],
  dssProxyActionsDsr: contractDesc(
    dssProxyActionsDsr,
    '0x07ee93aEEa0a36FfF2A9B95dd22Bd6049EE54f26',
  ),
  magicLink: {
    apiKey: '',
  },
  cacheApi: '',
}

export type NetworkConfig = typeof protoMain

const main: NetworkConfig = protoMain
const velas: NetworkConfig = protoVelas
const velasTestnet: NetworkConfig = protoVelasTestnet

const kovan: NetworkConfig = {
  id: '42',
  name: 'kovan',
  label: 'Kovan',
  infuraUrl: `https://kovan.infura.io/v3/${infuraProjectId}`,
  infuraUrlWS: `wss://kovan.infura.io/ws/v3/${infuraProjectId}`,
  safeConfirmations: 6,
  otc: contractDesc(otc, '0xe325acB9765b02b8b418199bf9650972299235F4'),
  collaterals: getCollaterals(kovanAddresses),
  tokens: {
    ...getCollateralTokens(kovanAddresses),
    WVLX: contractDesc(vlx, kovanAddresses['VLX']),
    USDV: contractDesc(erc20, kovanAddresses['MCD_USDV']),
    USDC: contractDesc(erc20, '0x198419c5c340e8De47ce4C0E4711A03664d42CB2'),
    VDGT: contractDesc(erc20, kovanAddresses.MCD_GOV),
    CHAI: contractDesc(erc20, '0xb641957b6c29310926110848db2d464c8c3c3f38'),
    // WBTC: contractDesc(erc20, '0xA08d982C2deBa0DbE433a9C6177a219E96CeE656'),
  },
  joins: {
    ...getCollateralJoinContracts(kovanAddresses),
  },
  getCdps: contractDesc(getCdps, kovanAddresses.GET_CDPS),
  mcdOsms: getOsms(kovanAddresses),
  mcdPot: contractDesc(mcdPot, kovanAddresses.MCD_POT),
  mcdJug: contractDesc(mcdJug, kovanAddresses.MCD_JUG),
  mcdEnd: contractDesc(mcdEnd, kovanAddresses.MCD_END),
  mcdSpot: contractDesc(mcdSpot, kovanAddresses.MCD_SPOT),
  mcdDog: contractDesc(mcdDog, kovanAddresses.MCD_DOG),
  dssCdpManager: contractDesc(dssCdpManager, kovanAddresses.CDP_MANAGER),
  otcSupportMethods: contractDesc(otcSupport, '0x303f2bf24d98325479932881657f45567b3e47a8'),
  vat: contractDesc(vat, kovanAddresses.MCD_VAT),
  mcdJoinUsdv: contractDesc(mcdJoinUsdv, kovanAddresses.MCD_JOIN_USDV),
  dsProxyRegistry: contractDesc(dsProxyRegistry, kovanAddresses.PROXY_REGISTRY),
  dsProxyFactory: contractDesc(dsProxyFactory, kovanAddresses.PROXY_FACTORY),
  dssProxyActions: contractDesc(dssProxyActions, kovanAddresses.PROXY_ACTIONS),
  etherscan: {
    url: 'https://kovan.etherscan.io',
    apiUrl: 'https://api-kovan.etherscan.io/api',
    apiKey: etherscanAPIKey || '',
  },
  taxProxyRegistries: [kovanAddresses.PROXY_REGISTRY],
  dssProxyActionsDsr: contractDesc(dssProxyActionsDsr, kovanAddresses.PROXY_ACTIONS_DSR),
  magicLink: {
    apiKey: '',
  },
  cacheApi: 'https://oazo-bcache-kovan-staging.new.oasis.app/api/v1',
}

const hardhat: NetworkConfig = {
  ...protoMain,
  id: '2137',
  name: 'hardhat',
  label: 'Hardhat',
  infuraUrl: `http://localhost:8545`,
  infuraUrlWS: `ws://localhost:8545`,
  cacheApi: 'http://localhost:3001/v1',
}

export const networksById = keyBy([main, kovan, hardhat, velas, velasTestnet], 'id')
export const networksByName = keyBy([main, kovan, hardhat, velas, velasTestnet], 'name')

export const dappName = 'Oasis'
export const pollingInterval = 12000
