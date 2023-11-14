import * as React from 'react';

import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import TariLogoWhite from './content/tari-logo-white.svg';
import { WalletSelection } from './WalletSelection';

export default function Header() {
    return (
        <AppBar
            position="static"
            color="transparent"
            elevation={0}
        >
            <Toolbar sx={{ justifyContent: 'space-between', padding: 2 }}>
                <Stack direction='row'>
                    <Typography variant="h6" color="inherit" noWrap sx={{ mx: 1 }}>
                        Tari.js Example Site
                    </Typography>
                </Stack>

                <TariConnectButton />
            </Toolbar>

        </AppBar>);
}


function TariConnectButton() {
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
            <WalletSelection
                open={walletSelectionOpen}
                onClose={onWalletSelectionClose}
            />
        </div>
    );
}