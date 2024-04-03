import { TariProvider  } from './providers'
import * as utils from './utils'
import {
  Account,
  TransactionStatus,
  TransactionResult,
  SubmitTransactionResponse,
  SubmitTransactionRequest,
  VaultBalances,
  VaultData,
  TemplateDefinition,
  SubstateRequirement,
  Substate,
} from './providers/types'
import {MetamaskTariProvider}  from "./providers/metamask";
import { MetaMaskInpageProvider } from '@metamask/providers';
import {WalletDaemonTariProvider, WalletDaemonParameters} from "./providers/wallet_daemon";
import {TariPermissions} from "./providers/wallet_daemon";
import * as permissions from "./providers/wallet_daemon";

export {
  utils,
  TariProvider,
  Account,
  TransactionStatus,
  TransactionResult,
  SubmitTransactionResponse,
  SubmitTransactionRequest,
  VaultBalances,
  VaultData,
  TemplateDefinition,
  SubstateRequirement,
  MetamaskTariProvider,
  WalletDaemonTariProvider,
  WalletDaemonParameters,
  TariPermissions,
  MetaMaskInpageProvider,
  Substate,
  permissions,
};