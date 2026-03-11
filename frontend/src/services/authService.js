const API_URL = import.meta.env.VITE_API_BASE_URL || 
                'http://localhost:8080/api';

const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Login failed (${response.status})`);
    }
    
    return response.json();
  },

  register: async (userData) => {
    // userData peut être soit l'ancien format (email, password, role) soit le nouveau format complet
    let requestBody;
    
    if (typeof userData === 'object' && userData.firstName) {
      // Nouveau format complet
      requestBody = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        birthDate: userData.birthDate || null,
        companyName: userData.companyName,
        country: userData.country,
        role: userData.role
      };
    } else {
      // Ancien format pour compatibilité (email, password, role)
      requestBody = {
        email: userData.email || userData,
        password: userData.password,
        role: userData.role
      };
    }
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Register failed (${response.status})`);
    }
    
    return response.json();
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.ok;
  },

  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    return response.ok;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken: () => localStorage.getItem('token'),
  
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => !!localStorage.getItem('token')
};

export default authService;
