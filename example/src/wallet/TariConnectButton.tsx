import * as React from 'react';

import Button from "@mui/material/Button";
import TariLogoWhite from './content/tari-logo-white.svg';
import { TariWalletSelectionDialog } from './TariWalletSelectionDialog';

export function TariConnectButton() {
    const [walletSelectionOpen, setWalletSelectionOpen] = React.useState(false);

    const handleConnectClick = () => {
        console.log("Header connection button");
        setWalletSelectionOpen(true);
    };

    const onWalletSelectionClose = () => {
        setWalletSelectionOpen(false);
    };

    return (
        <div>
            <Button variant='contained' onClick={async () => { await handleConnectClick() }}>
                <img width="30px" height="30px" src={TariLogoWhite} />
                <div style={{ paddingLeft: '10px' }}>Connect</div>
            </Button>
            <TariWalletSelectionDialog
                open={walletSelectionOpen}
                onClose={onWalletSelectionClose}
            />
        </div>
    );
}