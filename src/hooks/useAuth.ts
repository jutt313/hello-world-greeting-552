
import { useState } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export const useAuth = () => {
  const [user] = useState<User | null>({
    id: '1',
    email: 'user@example.com',
    name: 'Demo User',
  });

  return {
    user,
    isLoading: false,
    error: null,
  };
};
