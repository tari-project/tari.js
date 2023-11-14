import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import TariLogo from './content/tari-logo.svg';
import MetamaskLogo from './content/metamask-logo.svg';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { MetamaskTariProvider } from "../../../src/providers/metamask";

const SNAP_ID = import.meta.env.VITE_SNAP_ORIGIN || "local:http://localhost:8080";

export interface WalletSelectionProps {
    open: boolean;
    onClose: () => void;
}

export function TariWalletSelection(props: WalletSelectionProps) {
    const { onClose, open } = props;

    const handleClose = () => {
        onClose();
    };

    const onWalletDaemonClick = () => {
        console.log('Wallet daemon click!');
    };

    const onMetamaskClick = async () => {
	    const metamaskProvider = new MetamaskTariProvider(SNAP_ID, window.ethereum);
        await metamaskProvider.connect();
        window.tari = metamaskProvider;
    };

    return (
        <Dialog fullWidth={true} onClose={handleClose} open={open}>
            <Box sx={{ padding: 4, borderRadius: 4 }}>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography style={{ fontSize: 24 }}>Connect a wallet</Typography>
                    <IconButton aria-label="copy" onClick={handleClose}>
                        <CloseIcon style={{ fontSize: 24 }} />
                    </IconButton>
                </Stack>
                <Divider sx={{ mt: 3, mb: 3 }} variant="middle" />
                <Grid container spacing={2} justifyContent='center'>
                    <Grid item xs={4}>
                        <WalletConnectionMethodCard img={TariLogo} text='Tari Wallet Daemon' callback={onWalletDaemonClick}></WalletConnectionMethodCard>
                    </Grid>
                    <Grid item xs={4}>
                        <WalletConnectionMethodCard img={MetamaskLogo} text='MetaMask' callback={onMetamaskClick}></WalletConnectionMethodCard>
                    </Grid>
                </Grid>
            </Box>
        </Dialog >
    );
}

function WalletConnectionMethodCard({ img, text, callback }: any) {
    return (
        <Card variant="outlined" elevation={0} sx={{ mty: 4, padding: 4, borderRadius: 4, width: '175px', height: '175px', cursor: 'pointer' }}>
            <CardContent onClick={async () => { await callback() }}>
                <Stack direction="column" spacing={2} alignItems='center'>
                    <Box sx={{ textAlign: 'center', width: '100%' }}>
                        <img style={{ borderRadius: 8, width: '50px', height: '50px' }} src={img} />
                    </Box>
                    <Typography textAlign='center'>{text}</Typography>
                </Stack>
            </CardContent>
        </Card>
    );
};