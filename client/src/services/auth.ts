interface LoginCredentials {
  username: string;
  password: string;
}

export const login = async (credentials: LoginCredentials): Promise<boolean> => {
  // Basit doğrulama
  if (credentials.username === 'admin' && credentials.password === '1234') {
    localStorage.setItem('isAuthenticated', 'true');
    return true;
  }
  return false;
};

export const logout = (): void => {
  localStorage.removeItem('isAuthenticated');
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('isAuthenticated') === 'true';
};
