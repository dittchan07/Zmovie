export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  isLoggedIn: boolean;
}
