import * as React from 'react';
import { Typography, Container, Button, Paper, Stack, Divider, TextField } from '@mui/material';
import { TransactionRequest } from '../../src/providers';
import Header from './Header';

export default function App() {
	return (
		<div>
			<Header></Header>
			<Divider></Divider>
			<Container maxWidth="sm" sx={{ mt: 6 }}>
				<Stack direction='column' spacing={2}>
					<AccountTest></AccountTest>
					<SubstateTest></SubstateTest>
					<TransactionTest></TransactionTest>
				</Stack>
			</Container>
		</div>

	);
}

function AccountTest() {
	const [accountData, setAccountData] = React.useState({});

	async function getAccountClick() {
		const res = await window.tari?.getAccount();
		console.log({ res });
		setAccountData(res)
	}

	return (
		<Paper variant="outlined" elevation={0} sx={{ mty: 4, padding: 3, borderRadius: 4 }}>
			<Stack direction="column" spacing={2}>
				<Button variant='contained' sx={{ width: '50%' }} onClick={async () => { await getAccountClick() }}>Get Account Data</Button>
				<Typography>Result: </Typography>
				<PrettyJson value={{ accountData }}></PrettyJson>
			</Stack>
		</Paper>
	);
};

function SubstateTest() {
	const [address, setAddress] = React.useState("");
	const [substate, setSubstate] = React.useState({});

	const handleAddressChange = async (event: any) => {
		setAddress(event.target.value);
	};

	async function getSubstateClick() {
		const res = await window.tari?.getSubstate(address);
		console.log({ res });
		setSubstate(res);
	}

	return (
		<Paper variant="outlined" elevation={0} sx={{ mty: 4, padding: 3, borderRadius: 4 }}>
			<Stack direction="column" spacing={2}>
				<Typography>This test gets the substate content of a substate address</Typography>
				<TextField sx={{ width: '100%' }}
					id="input-url"
					value={address}
					onChange={handleAddressChange}
					placeholder="Substate address ('component_XXXXX', 'resource_XXXX', etc.)"
					InputProps={{
						sx: { borderRadius: 4, mt: 1 },
					}}></TextField>
				<Button variant='contained' sx={{ width: '50%' }} onClick={async () => { await getSubstateClick() }}>Get Substate</Button>
				<Typography>Result: </Typography>
				<PrettyJson value={{ substate }}></PrettyJson>
			</Stack>
		</Paper>
	);
};

function TransactionTest() {
	const [accountComponent, setAccountComponent] = React.useState("");
	const [transactionResult, setTransactionResult] = React.useState({});

	const handleAccountComponentChange = async (event: any) => {
		setAccountComponent(event.target.value);
	};

	async function submitTransactionClick() {
		const req: TransactionRequest = {
			account_index: 0,
			instructions: [
				{
					"CallMethod": {
						"component_address": accountComponent,
						"method": "get_balances",
						"args": []
					}
				}
			],
			input_refs: [],
			required_substates: [{ address: accountComponent, version: null }],
			is_dry_run: true,
		};
		const res = await window.tari?.submitTransaction(req);
		console.log({ res });
		setTransactionResult(res);
	}

	return (
		<Paper variant="outlined" elevation={0} sx={{ mty: 4, padding: 3, borderRadius: 4 }}>
			<Stack direction="column" spacing={2}>
				<Typography>This test submits a transaction to an account component to get its balances</Typography>
				<TextField sx={{ width: '100%' }}
					id="input-url"
					value={accountComponent}
					onChange={handleAccountComponentChange}
					placeholder="Account component address ('component_XXXXX')"
					InputProps={{
						sx: { borderRadius: 4, mt: 1 },
					}}></TextField>
				<Button variant='contained' sx={{ width: '50%' }} onClick={async () => { await submitTransactionClick() }}>Submit Transaction</Button>
				<Typography>Result: </Typography>
				<PrettyJson value={{ transactionResult }}></PrettyJson>
			</Stack>
		</Paper>
	);
};

function PrettyJson({ value }: any) {
	return (
		<pre>{JSON.stringify(value, null, 2)}</pre>
	);
};
