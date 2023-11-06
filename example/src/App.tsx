import * as React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { TariConnection, TariConnectorButton } from 'tari.js/src/providers/wallet_daemon/index';
import {
	TariPermissions,
	TariPermissionAccountList,
	TariPermissionTransactionSend
} from "tari.js/src/providers/wallet_daemon/tari_permissions";

export default function App() {
	return (
		<Container maxWidth="sm">
			<Box sx={{ my: 4 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					Tari-Connector Example
				</Typography>
				<Connector />
			</Box>
		</Container>
	);
}

function Connector() {
	const [tari, setTari] = React.useState<TariConnection | undefined>();
	const onOpen = (tari: TariConnection) => {
		console.log("OnOpen");
		setTari(tari);
		window.tari = tari;
	};
	const onConnection = () => {
		console.log("Connected to the wallet daemon");
	};
	let address = import.meta.env.VITE_SIGNALING_SERVER_ADDRESS || "http://localhost:9100";
	let permissions = new TariPermissions();
	permissions.addPermission(new TariPermissionAccountList())
	permissions.addPermission(
		new TariPermissionTransactionSend()
	);

	let optional_permissions = new TariPermissions();

	return (
		<>
			<TariConnectorButton
				signalingServer={address}
				permissions={permissions}
				optional_permissions={optional_permissions}
				onOpen={onOpen}
				onConnection={onConnection}
			/>
		</>
	);
}
