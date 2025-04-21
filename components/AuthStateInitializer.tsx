'use client';

import { useEffect } from 'react';
import { authService } from '@/services/authService';

export default function AuthStateInitializer() {
  useEffect(() => {
    // Function to initialize auth state
    const initializeAuth = async () => {
      try {
        console.log('AuthStateInitializer - Starting initialization');
        // Check if token exists
        if (authService.isAuthenticated()) {
          console.log('AuthStateInitializer - Token found, initializing auth state');
          
          // Try to get user info from localStorage first
          const user = authService.getCurrentUser();
          
          if (user) {
            console.log('AuthStateInitializer - User info found in localStorage');
            
            // Check admin status and store it
            const isAdmin = user.roles?.some(
              (role: any) => role && role.name && role.name.toUpperCase() === 'ADMIN'
            );
            
            // Store admin status in localStorage
            localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
            
            // Dispatch auth changed event to notify components
            window.dispatchEvent(new Event('auth-changed'));
            console.log('AuthStateInitializer - Auth changed event dispatched');
          } else {
            console.log('AuthStateInitializer - No user info found, fetching from API');
            // Try to fetch user info
            const userInfo = await authService.getUserInfo();
            
            if (userInfo) {
              console.log('AuthStateInitializer - User info fetched successfully');
              // Check admin status and store it
              const isAdmin = userInfo.roles?.some(
                (role: any) => role && role.name && role.name.toUpperCase() === 'ADMIN'
              );
              
              // Store admin status in localStorage
              localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
              
              // Dispatch auth changed event to notify components
              window.dispatchEvent(new Event('auth-changed'));
              console.log('AuthStateInitializer - Auth changed event dispatched');
            }
          }
          
          // Refresh token in the background
          authService.refreshToken().then(() => {
            // Setup automatic token refresh
            authService.setupTokenRefresh();
            
            // Dispatch another auth changed event after token refresh
            window.dispatchEvent(new Event('auth-changed'));
          });
        } else {
          console.log('AuthStateInitializer - No token found, no action needed');
        }
      } catch (error) {
        console.error('AuthStateInitializer - Error initializing auth state:', error);
      }
    };
    
    // Initialize auth state when component mounts
    initializeAuth();
  }, []);
  
  // This component doesn't render anything
  return null;
} 