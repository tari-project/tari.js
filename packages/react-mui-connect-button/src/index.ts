export { TariConnectButton, TariConnectButtonProps } from "./TariConnectButton";
export { TariWalletSelectionDialog, WalletSelectionProps } from "./TariWalletSelectionDialog";
import {
  TariPermissionAccountInfo,
  TariPermissionKeyList,
  TariPermissions,
  TariPermissionSubstatesRead,
  TariPermissionTemplatesRead,
  TariPermissionTransactionSend,
  TariPermissionTransactionsGet,
} from "@tari-project/tari-permissions";

export function defaultPermissions() {
  // Minimal permissions for the example site
  // But each application will have different permission needs
  const walletDaemonPermissions = new TariPermissions();
  walletDaemonPermissions
    // Required for createFreeTestCoins
    .addPermission("Admin")
    .addPermission(new TariPermissionKeyList())
    .addPermission(new TariPermissionAccountInfo())
    .addPermission(new TariPermissionTransactionsGet())
    .addPermission(new TariPermissionSubstatesRead())
    .addPermission(new TariPermissionTemplatesRead())
    .addPermission(new TariPermissionTransactionSend());
  return walletDaemonPermissions;
}
