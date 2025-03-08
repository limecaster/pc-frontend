import { cookies } from 'next/headers';

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return null;
    }

    // You can add token verification here if needed
    // For example, decode JWT and check if it's valid
    
    // Return a simple session object with user info
    return {
      user: {
        id: 'user_id', // You would normally extract this from the token
        isLoggedIn: true
      }
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}
