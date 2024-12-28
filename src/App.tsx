import { WalletContextProvider } from './contexts/WalletProvider';
import { Points } from './pages/points';

function App() {
  return (
    <WalletContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Terminal />} />
          <Route path="/airdrop" element={<Airdrop />} />
        </Routes>
      </Router>
    </WalletContextProvider>
  );
}

export default App;