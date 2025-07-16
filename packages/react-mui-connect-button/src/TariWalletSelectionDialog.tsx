import { Box, Dialog, Divider, Stack, IconButton, Typography, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { TariSigner } from "@tari-project/tari-signer";
import { WalletDaemonTariSigner, WalletDaemonFetchParameters } from "@tari-project/wallet-daemon-signer";
import { ReactElement, useState } from "react";
import { WalletConnectTariSigner, WalletConnectParameters } from "@tari-project/wallet-connect-signer";
import { TariLogo, WalletConnectLogo } from "./Logos";

export interface WalletSelectionProps {
  open: boolean;
  onConnected?: (signer: TariSigner) => void;
  walletConnectParams?: WalletConnectParameters;
  walletDaemonParams?: WalletDaemonFetchParameters;
  onClose: () => void;
}

export function TariWalletSelectionDialog(props: WalletSelectionProps): ReactElement {
  const { onClose, open, onConnected, walletConnectParams, walletDaemonParams } = props;
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = onClose;

  const onWalletDaemonClick = async () => {
    if (!walletDaemonParams) {
      throw new Error("Wallet Daemon parameters were not provided.");
    }
    const walletDaemonSigner = await WalletDaemonTariSigner.buildFetchSigner(walletDaemonParams);
    onConnected?.(walletDaemonSigner);
    handleClose();
  };

  const onWalletConnectClick = async () => {
    if (!walletConnectParams?.projectId) {
      throw new Error("WalletConnect params was not provided.");
    }
    setIsBusy(true);
    setError(null);
    try {
      const walletConnectSigner = WalletConnectTariSigner.init(walletConnectParams);
      const showDialog = await walletConnectSigner.connect();
      // This must be before the showDialog call to prevent the dialog from appearing on top of the WalletConnect modal.
      handleClose();
      await showDialog();
      onConnected?.(walletConnectSigner);
    } catch (err) {
      console.error("Error connecting to WalletConnect:", err);
      setError(`Failed to connect to WalletConnect. ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsBusy(false);
    }
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
        {error && (
          <Box sx={{ padding: 2, backgroundColor: "error.main", color: "white", borderRadius: 1, marginBottom: 2 }}>
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}
        <Grid container spacing={2} justifyContent="center">
          {walletDaemonParams && (
            <Grid size={{ xs: 4 }}>
              <WalletConnectionMethodCard
                logo={<TariLogo />}
                text="Tari Wallet Daemon"
                callback={onWalletDaemonClick}
              ></WalletConnectionMethodCard>
            </Grid>
          )}
          {walletConnectParams?.projectId && (
            <Grid size={{ xs: 4 }}>
              {isBusy ? (
                <CircularProgress />
              ) : (
                <WalletConnectionMethodCard
                  logo={<WalletConnectLogo />}
                  text="WalletConnect"
                  callback={onWalletConnectClick}
                />
              )}
            </Grid>
          )}
        </Grid>
      </Box>
    </Dialog>
  );
}

function WalletConnectionMethodCard({
  logo,
  text,
  callback,
}: {
  logo: ReactElement;
  text: string;
  callback: () => void;
}) {
  return (
    <Card
      variant="outlined"
      elevation={0}
      sx={{ mty: 4, padding: 4, borderRadius: 4, width: "175px", height: "175px", cursor: "pointer" }}
    >
      <CardContent onClick={callback}>
        <Stack direction="column" spacing={2} alignItems="center">
          <Box sx={{ textAlign: "center", width: "100%" }}>
            <div style={{ borderRadius: 8, width: "50px", height: "50px" }}>{logo}</div>
          </Box>
          <Typography textAlign="center">{text}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
