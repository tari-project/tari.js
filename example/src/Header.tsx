import * as React from 'react';

import AppBar from "@mui/material/AppBar";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { TariConnectButton } from './wallet/TariConnectButton';

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