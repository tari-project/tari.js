import * as React from "react";

import Button from "@mui/material/Button";
import { TariWalletSelectionDialog } from "./TariWalletSelectionDialog";
import { TariProvider } from "@tari-project/tari-provider";
import { TariSigner } from "@tari-project/tari-signer";
import TariLogoWhite from "./TariLogoWhite";


export interface TariConnectButtonProps {
  isConnected: boolean;
  onConnected?: (signer: TariSigner) => void;
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
      <Button variant="contained" onClick={handleConnectClick}>
        <TariLogoWhite />
        <div style={{ paddingLeft: "10px" }}>{props.isConnected ? "Connected" : "Connect"}</div>
      </Button>
      <TariWalletSelectionDialog
        open={walletSelectionOpen}
        onClose={onWalletSelectionClose}
        onConnected={props.onConnected}
      />
    </>
  );
}
