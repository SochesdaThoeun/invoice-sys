import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthPage } from './pages/AuthPage';
import { ThemeProvider } from './components/theme-provider';
import { ProtectedRoutes } from './components/ProtectedRoutes';



function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
