import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Mainnet, DAppProvider, Config, MoonbaseAlpha} from '@usedapp/core';

const config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: 'https://eth-mainnet.g.alchemy.com/v2/J038e3gaccJC6Ue0BrvmpjzxsdfGly9n',
    [MoonbaseAlpha.chainId]: 'https://rpc.api.moonbase.moonbeam.network/',
  },
  refresh: 'never'
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>  
  </React.StrictMode>
);