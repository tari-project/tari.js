import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import type { AccountData, TariSigner } from "@tari-project/tarijs-all";
import { TariConnectButton } from "@tari-project/react-mui-connect-button";

const WC_PROJECT_ID = "78f3485d08b9640a087cbcea000e1f8b"; // Replace with your actual WalletConnect project ID

function App() {
  const [signer, setSigner] = useState<TariSigner | null>(null);
  const [account, setAccount] = useState<AccountData | null>(null);

  const onConnected = async (signer: TariSigner) => {
    setSigner(signer);
    const account = await signer.getAccount();
    setAccount(account);
  };

  return (
    <>
      <TariConnectButton
        isConnected={signer?.isConnected() || false}
        walletConnectProjectId={WC_PROJECT_ID}
        onConnected={onConnected}
      />
      {account ? (
        <div>
          <h2>Connected Account</h2>
          <p>Account ID: {account.account_id}</p>
          <p>Address: {account.address}</p>
          <p>Public Key: {account.public_key}</p>
          <h3>Resources:</h3>
          <ul>
            {account.resources.map((resource, index) => (
              <li key={index}>
                {resource.type} - {resource.balance} {resource.token_symbol}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

export default App;
