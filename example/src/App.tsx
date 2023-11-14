import * as React from 'react';
import { Box, Typography, Container, Button, Paper, Stack, Divider } from '@mui/material';
import { TariConnectorButton, WalletDaemonParameters, WalletDaemonTariProvider } from 'tari.js/src/providers/wallet_daemon/index';
import {
	TariPermissions,
	TariPermissionTransactionSend,
	TariPermissionAccountInfo,
	TariPermissionKeyList
} from "tari.js/src/providers/wallet_daemon/tari_permissions";
import { TransactionRequest } from '../../src/providers';
import { MetamaskTariProvider } from '../../src/providers/metamask';
import { useState } from 'react';
import Header from './Header';

export default function App() {
	const [accountData, setAccountData] = React.useState({});
	const [substate, setSubstate] = React.useState({});
	const [transactionSubmitResult, setTransactionSubmitResult] = React.useState({});

	async function getAccountClick() {
		const res = await window.tari?.getAccount();
		console.log({ res });
		setAccountData(res)
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
		const res = await window.tari?.submitTransaction(req);
		console.log({ res });
	}

	async function getSubstateClick() {
		const substate_address = "component_841ac151e9d4fa71715663a7ac94c20ceae5fc4b0fb399c3937ba1f09068f810";
		const res = await window.tari?.getSubstate(substate_address);
		console.log({ res });
		setTransactionSubmitResult(res);
	}

	return (
		<div>
			<Header></Header>
			<Divider></Divider>
			<Container maxWidth="sm" sx={{ mt: 6 }}>
				<Stack direction='column' spacing={2}>
					<ActionCard buttonText={"Get Account Data"} buttonCallback={getAccountClick} value={accountData}></ActionCard>
					<ActionCard buttonText={"Get Substate"} buttonCallback={getSubstateClick} value={substate}></ActionCard>
					<ActionCard buttonText={"Submit Transaction"} buttonCallback={submitTransactionClick} value={transactionSubmitResult}></ActionCard>
				</Stack>
			</Container>
		</div>

	);
}

function ActionCard({ buttonText, buttonCallback, value }: any) {
	return (
		<Paper variant="outlined" elevation={0} sx={{ mty: 4, padding: 3, borderRadius: 4 }}>
			<Stack direction="column" spacing={2}>
				<Button variant='contained' sx={{ width: '50%' }} onClick={async () => { await buttonCallback() }}>{buttonText}</Button>
				<Typography>Result: </Typography>
				<PrettyJson value={{ value }}></PrettyJson>
			</Stack>
		</Paper>
	);
};

function PrettyJson({ value }: any) {
	return (
		<pre>{JSON.stringify(value, null, 2)}</pre>
	);
};

function buildWalletDaemonPermissions() {
	let permissions = new TariPermissions();
	permissions.addPermission(new TariPermissionKeyList());
	permissions.addPermission(new TariPermissionAccountInfo());
	permissions.addPermission(
		new TariPermissionTransactionSend()
	);

	let optionalPermissions = new TariPermissions();

	return { permissions, optionalPermissions }
}

function WalletDaemonDefaultButton() {
	const onOpen = (provider: WalletDaemonTariProvider) => {
		window.tari = provider;
	};
	const onConnection = () => {
		console.log("Connected to the wallet daemon");
	};
	let address = import.meta.env.VITE_SIGNALING_SERVER_ADDRESS || "http://localhost:9100";
	let { permissions, optionalPermissions } = buildWalletDaemonPermissions();

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
	let { permissions, optionalPermissions } = buildWalletDaemonPermissions();

	async function handleClick() {
		const params: WalletDaemonParameters = {
			signalingServerUrl,
			permissions,
			optionalPermissions,
			onConnection: function (): void {
				console.log("Connected to the wallet daemon via custom button");
			}
		};
		const provider = await WalletDaemonTariProvider.build(params);
		console.log("Token URL: " + provider.tokenUrl);
	}

	return <Button variant='contained' onClick={async () => { await handleClick() }}>Wallet Daemon Custom Buttom</Button>
}

function MetamaskButton() {
	const snapId = import.meta.env.VITE_SNAP_ORIGIN || "local:http://localhost:8080";
	const metamask = window.ethereum;

	const initialProvider = new MetamaskTariProvider(snapId, metamask);
	const [provider, setProvider] = useState(initialProvider);

	async function handleClick() {
		console.log({ provider });
		await provider.connect();
		console.log({ provider });

		setProvider(provider);
		window.tari = provider;
	}

	return (
		<div>
			<Typography>Connected: {provider.isConnected}</Typography>
			<Button variant='contained' onClick={async () => { await handleClick() }}>Connect to Metamask</Button>
		</div>
	)
}
