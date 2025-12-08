import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import './global.css';
import AttendanceScreen from './src/screens/AttendanceScreen';
import LoginScreen from './src/screens/LoginScreen';
import { getUserSession, saveUserSession, clearUserSession } from './src/utils/authService';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      // Race between getUserSession and a 3-second timeout
      const session = await Promise.race([
        getUserSession(),
        new Promise(resolve => setTimeout(() => resolve(null), 3000))
      ]);

      if (session) {
        setUser(session);
      }
    } catch (e) {
      console.log("Session check failed", e);
    } finally {
      // Always stop loading
      setLoading(false);
    }
  };

  const handleLogin = async (userData) => {
    await saveUserSession(userData);
    setUser(userData);
  };

  const handleLogout = async () => {
    await clearUserSession();
    setUser(null);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-gray-100">
        <StatusBar style="dark" />
        {user ? (
          user.role === 'admin' ? (
            // Admin Flow
            // Admin Flow
            <AdminFlow user={user} onLogout={handleLogout} />
          ) : (
            // Regular User Flow (if needed)
            <AttendanceScreen user={user} onLogout={handleLogout} />
          )
        ) : (
          <LoginScreen onLoginSuccess={handleLogin} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

// Wrapper to handle Admin vs Kiosk view
function AdminFlow({ user, onLogout }) {
  const [view, setView] = React.useState('admin'); // 'admin' or 'kiosk'
  const [kioskStatus, setKioskStatus] = React.useState('Ready');

  // Import dynamically or use require if needed, but they are already imported at top
  // assuming AdminScreen is imported.
  const AdminScreen = require('./src/screens/AdminScreen').default;
  // We reuse AttendanceScreen but need to make it Kiosk aware
  // For now, let's pass a special user object or prop

  if (view === 'kiosk') {
    return (
      <AttendanceScreen
        user={{ name: 'Kiosk Mode', id: 'KIOSK', role: 'admin' }}
        isKiosk={true}
        onLogout={() => setView('admin')} // "Logout" in Kiosk exits to Admin
      />
    );
  }

  return (
    <AdminScreen
      onBack={onLogout} // Logout from Admin
      onLaunchKiosk={() => setView('kiosk')}
    // We need to pass the prop onLaunchKiosk to AdminScreen 
    // but AdminScreen currently uses onBack for everything, let's fix that usage
    // Actually AdminScreen calls onBack for "Logout" in my previous edit? 
    // No, "Logout" button calls onBack. 
    // "Launch Kiosk" button checks onBack too in the previous edit (oops).
    // I need to fix AdminScreen props.
    />
  );
}
