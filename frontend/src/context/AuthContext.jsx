import { createContext, useContext, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Vérification expiration AVANT initialisation
  const checkAndCleanExpiredToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return null;
        }
        return token;
      } catch(e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  };

  const validToken = checkAndCleanExpiredToken();
  const [user, setUser] = useState(
    validToken ? authService.getUser() : null
  );
  const [tokenState, setTokenState] = useState(validToken);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      email: data.email, role: data.role
    }));
    setTokenState(data.token);
    setUser({ email: data.email, role: data.role });
    return data;
  };

  const logout = () => {
    authService.logout();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token: tokenState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
