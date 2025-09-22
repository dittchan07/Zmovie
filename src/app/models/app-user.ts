export interface AppUser {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  name: string; 
}
