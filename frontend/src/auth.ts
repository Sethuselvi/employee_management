import { ref } from 'vue'

export const isLoggedIn = ref(!!localStorage.getItem('token'))

// Function to decode JWT token and get user role
export function decodeToken(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// Function to get user role from token
export function getUserRole(): string | null {
  const token = localStorage.getItem('token');
  if (token) {
    const decoded = decodeToken(token);
    return decoded?.role || null;
  }
  return null;
}

// Function to check if user is admin or manager
export function isAdminOrManager(): boolean {
  const role = getUserRole();
  return role === 'admin' || role === 'manager';
} 