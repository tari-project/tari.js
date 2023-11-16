import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import styles from './TariWalletDaemonConnectDialog.module.css';
import { TariPermissions } from "../../../src/providers/wallet_daemon/tari_permissions";
import { WalletDaemonParameters, WalletDaemonTariProvider } from "../../../src/providers/wallet_daemon/provider";

export interface TariWalletDaemonConnectDialog {
    open: boolean;
    onClose: () => void;
    signalingServerUrl: string;
    permissions: TariPermissions;
    optionalPermissions: TariPermissions;
}

export function TariWalletDaemonConnectDialog(props: TariWalletDaemonConnectDialog) {
    const { onClose, open } = props;

    const [isCopied, setIsCopied] = useState(false);
    const [fadeClass, setFadeClass] = useState('tariFadeIn');
    const [tokenUrl, setTokenUrl] = useState("");

    const onConnection = () => {
        console.log("wallet daemon connected");
        handleClose();
    };

    useEffect(() => {
        if (open) {
            setFadeClass('tariFadeIn');
            const params: WalletDaemonParameters = {
                signalingServerUrl: props.signalingServerUrl,
                permissions: props.permissions,
                optionalPermissions: props.optionalPermissions,
                onConnection,
            };
            WalletDaemonTariProvider.build(params)
                .then((provider) => {
                    window.tari = provider;
                    if (provider.tokenUrl) {
                        setTokenUrl(provider.tokenUrl);
                    }
                });
        }
    }, [open]);

    const handleClose = () => {
        onClose();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(tokenUrl);
        setIsCopied(true);
        setFadeClass('');
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    };

    return (
        <Dialog fullWidth={true} onClose={handleClose} open={open}>
            <Box sx={{ padding: 4, borderRadius: 4 }}>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography style={{ fontSize: 24 }}>Connect to your Tari Wallet Daemon</Typography>
                    <IconButton aria-label="copy" onClick={handleClose}>
                        <CloseIcon style={{ fontSize: 24 }} />
                    </IconButton>
                </Stack>
                <Divider sx={{ mt: 3, mb: 1 }} variant="middle" />
                <div className={styles.tariPopupContainer}>
                    <p className={styles.tariText}>
                        Scan the QR code or copy the link below to connect your wallet
                    </p>
                    <QRCodeSVG value={tokenUrl} />
                    <div className={styles.tariBtnContainer}>
                        <button
                            className={[styles.tariBtn, styles.tariPrimaryBtn].join(' ')}
                            onClick={handleCopy}
                        >
                            {isCopied ? <CheckMark /> : 'Copy Link'}
                        </button>
                        <button
                            className={[styles.tariBtn, styles.tariSecondaryBtn].join(
                                ' '
                            )}
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Box>
        </Dialog >
    );
}

const CheckMark = () => {
    return (
        <svg
            className={styles.tariCheckmark}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
        >
            <circle
                className={styles.tariCheckmarkCircle}
                cx="26"
                cy="26"
                r="25"
                fill="none"
            />
            <path
                className={styles.tariCheckmarkCheck}
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />
        </svg>
    );
};
