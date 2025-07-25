import * as React from "react";

import Button from "@mui/material/Button";
import { TariWalletSelectionDialog } from "./TariWalletSelectionDialog";
import { TariSigner } from "@tari-project/tari-signer";
import { TariLogoWhite } from "./Logos";
import { WalletDaemonFetchParameters } from "@tari-project/wallet-daemon-signer";
import { WalletConnectParameters } from "@tari-project/wallet-connect-signer";

export interface TariConnectButtonProps {
  isConnected: boolean;
  disabled?: boolean;
  onConnected?: (signer: TariSigner) => void;
  walletConnectParams?: WalletConnectParameters;
  walletDaemonParams?: WalletDaemonFetchParameters;
}

export function TariConnectButton(props: TariConnectButtonProps) {
  const [walletSelectionOpen, setWalletSelectionOpen] = React.useState(false);

  const handleConnectClick = () => {
    setWalletSelectionOpen(true);
  };

  const onWalletSelectionClose = () => {
    setWalletSelectionOpen(false);
  };

  return (
    <>
      {!props.walletDaemonParams && !props.walletConnectParams && (
        <div style={{ color: "red" }}>
          <strong>Warning:</strong> You must provide a WalletConnect project ID and/or Wallet Daemon parameters to use
          the Tari Connect Button.
        </div>
      )}
      <Button variant="contained" onClick={handleConnectClick} disabled={props.disabled || false}>
        <TariLogoWhite />
        <div style={{ paddingLeft: "10px" }}>{props.isConnected ? "Connected" : "Connect"}</div>
      </Button>
      <TariWalletSelectionDialog
        open={walletSelectionOpen}
        onClose={onWalletSelectionClose}
        onConnected={props.onConnected}
        walletConnectParams={props.walletConnectParams}
        walletDaemonParams={props.walletDaemonParams}
      />
    </>
  );
}
