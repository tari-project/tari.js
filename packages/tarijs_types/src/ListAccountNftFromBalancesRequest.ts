import { BalanceEntry } from "@tari-project/typescript-bindings";

export interface ListAccountNftFromBalancesRequest {
  balances: Array<BalanceEntry>;
}
