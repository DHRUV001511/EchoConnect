import React, { createContext, useContext, useEffect, useState } from 'react';
import { StreamVideoClient, Call } from '@stream-io/video-react-sdk';
import Cookies from 'universal-cookie';

interface User {
  id: string;
  name: string;
  username: string;
  image?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  call: Call | undefined;
  setCall: (call: Call | undefined) => void;
  client: StreamVideoClient | null;
  setClient: (client: StreamVideoClient | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const createStreamClient = async (user: User): Promise<StreamVideoClient> => {
  try {
    const client = new StreamVideoClient({
      apiKey: '4mdy2gxtmjpm', // Your API key
      user: {
        id: user.username,
        name: user.name,
        image: user.image,
      },
      tokenProvider: async () => {
        // Get token from your backend
        const response = await fetch('http://localhost:3001/auth/stream-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.username }),
        });
       
        if (!response.ok) {
          throw new Error(`Token request failed: ${response.status}`);
        }
       
        const data = await response.json();
        return data.token;
      },
    });
   
    return client;
  } catch (error) {
    console.error('Stream client creation failed:', error);
    throw error;
  }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [call, setCall] = useState<Call | undefined>();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const cookies = new Cookies();

  useEffect(() => {
    const initializeFromCookies = async () => {
      const username = cookies.get('username');
      const name = cookies.get('name');
      const token = cookies.get('token');

      if (username && name && token) {
        try {
          const userData: User = {
            id: username,
            name,
            username,
          };
          
          const streamClient = new StreamVideoClient({
            apiKey: '4mdy2gxtmjpm',
            user: {
              id: username,
              name,
            },
            token,
          });
          
          setUser(userData);
          setClient(streamClient);
        } catch (error) {
          console.error('Failed to initialize from cookies:', error);
          // Clear invalid cookies
          cookies.remove('token');
          cookies.remove('name');
          cookies.remove('username');
        }
      }
      setIsLoading(false);
    };

    initializeFromCookies();
  }, []);

  useEffect(() => {
    const initializeClient = async () => {
      if (user && !client) {
        try {
          console.log('Initializing Stream client for user:', user);
          const streamClient = await createStreamClient(user);
          setClient(streamClient);
          console.log('Stream client initialized successfully');
        } catch (error) {
          console.error('Failed to initialize Stream client:', error);
        }
      } else if (!user && client) {
        // Clean up client when user logs out
        setClient(null);
        setCall(undefined);
      }
    };

    if (!isLoading) {
      initializeClient();
    }
  }, [user, client, isLoading]);

  return (
    <UserContext.Provider value={{ user, setUser, call, setCall, client, setClient, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};