import * as React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { TariConnectorButton, TransactionRequest, WalletDaemonParameters, WalletDaemonProvider } from 'tari.js/src/providers/wallet_daemon/index';
import {
	TariPermissions,
	TariPermissionAccountList,
	TariPermissionTransactionSend,
	TariPermissionAccountInfo,
	TariPermissionKeyList
} from "tari.js/src/providers/wallet_daemon/tari_permissions";

export default function App() {
	async function getBalancesClick() {
		const res = await window.provider?.getAccountBalances("component_841ac151e9d4fa71715663a7ac94c20ceae5fc4b0fb399c3937ba1f09068f810");
		console.log({ res });
	}

	async function getAccountsClick() {
		const res = await window.provider?.getAccounts();
		console.log({ res });
	}

	async function submitTransactionClick() {
		const account = "component_841ac151e9d4fa71715663a7ac94c20ceae5fc4b0fb399c3937ba1f09068f810";
		const req: TransactionRequest = {
			account_index: 0,
			instructions: [
				{
					"CallMethod": {
						"component_address": account,
						"method": "get_balances",
						"args": []
					}
				}
			],
			input_refs: [],
			required_substates: [{ address: account, version: null }],
			is_dry_run: true,
		};
		const res = await window.provider?.submitTransaction(req);
		console.log({ res });
	}

	return (
		<Container maxWidth="sm">
			<Box sx={{ my: 4 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					Tari-Connector Example
				</Typography>
				<WalletDaemonDefaultButton />
				<WalletDaemonCustomButton />
				<Button variant='contained' onClick={async () => { await getAccountsClick() }}>Get Account keys</Button>
				<Button variant='contained' onClick={async () => { await getBalancesClick() }}>Get Balances</Button>
				<Button variant='contained' onClick={async () => { await submitTransactionClick() }}>Submit Transaction</Button>
			</Box>
		</Container>
	);
}

function WalletDaemonDefaultButton() {
	const onOpen = (provider: WalletDaemonProvider) => {
		window.provider = provider;
	};
	const onConnection = () => {
		console.log("Connected to the wallet daemon");
	};
	let address = import.meta.env.VITE_SIGNALING_SERVER_ADDRESS || "http://localhost:9100";
	let permissions = new TariPermissions();
	permissions.addPermission(new TariPermissionAccountList());
	permissions.addPermission(new TariPermissionAccountInfo());
	permissions.addPermission(new TariPermissionKeyList());
	permissions.addPermission(
		new TariPermissionTransactionSend()
	);

	let optionalPermissions = new TariPermissions();
	console.log({ permissions });

	return (
		<>
			<TariConnectorButton
				signalingServerUrl={address}
				permissions={permissions}
				optionalPermissions={optionalPermissions}
				onOpen={onOpen}
				onConnection={onConnection}
			/>
		</>
	);
}

function WalletDaemonCustomButton() {
	const signalingServerUrl = import.meta.env.VITE_SIGNALING_SERVER_ADDRESS || "http://localhost:9100";
	const permissions = new TariPermissions();
	permissions.addPermission(new TariPermissionAccountList())
	permissions.addPermission(
		new TariPermissionTransactionSend()
	);
	const optionalPermissions = new TariPermissions();

	async function handleClick() {
		const params: WalletDaemonParameters = {
			signalingServerUrl,
			permissions,
			optionalPermissions,
			onConnection: function (): void {
				console.log("Connected to the wallet daemon via custom button");
			}
		};
		const provider = await WalletDaemonProvider.build(params);
		console.log("Token URL: " + provider.tokenUrl);
	}

	return <Button variant='contained' onClick={async () => { await handleClick() }}>Wallet Daemon Custom Buttom</Button>
}
