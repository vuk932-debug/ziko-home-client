import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationContainer from './components/common/NotificationContainer';
import ConfirmationModal from './components/common/ConfirmationModal';

/**
 * App — Root component.
 * Wraps the app in BrowserRouter and delegates all routing to AppRoutes.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
          <NotificationContainer />
          <ConfirmationModal />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
// hello testing
export default App;
