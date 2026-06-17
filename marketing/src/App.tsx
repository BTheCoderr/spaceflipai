import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DeleteDataPage } from './pages/DeleteData';
import { HomePage } from './pages/Home';
import { PrivacyPage } from './pages/Privacy';
import { SupportPage } from './pages/Support';
import { TermsPage } from './pages/Terms';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="delete-data" element={<DeleteDataPage />} />
      </Route>
    </Routes>
  );
}
