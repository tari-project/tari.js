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
          {walletConnectParams?.projectId && (
            <Grid size={{ xs: 4 }}>
              {isBusy ? (
                <CircularProgress />
              ) : (
                <Grid container rowSpacing={1} columnSpacing={{ xs: 4 }}>
                  <WalletConnectionMethodCard
                    logo={<WalletConnectLogo />}
                    text="WalletConnect"
                    callback={onWalletConnectClick}
                  ></WalletConnectionMethodCard>
                </Grid>
              )}
            </Grid>
          )}

          {walletDaemonParams && (
            <Grid container rowSpacing={1} columnSpacing={{ xs: 4 }}>
              <WalletConnectionMethodCard
                logo={<TariLogo />}
                text="Tari Wallet Daemon"
                callback={onWalletDaemonClick}
              ></WalletConnectionMethodCard>
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
  callback: () => Promise<void>;
}) {
  return (
    <Card
      variant="outlined"
      elevation={0}
      sx={{
        padding: 4,
        borderRadius: 4,
        width: "175px",
        height: "175px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={async () => {
        await callback();
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: 0,
        }}
      >
        {logo}
        <Typography textAlign="center" sx={{ mt: 2 }}>
          {text}
        </Typography>
      </CardContent>
    </Card>
  );
}
