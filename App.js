import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AttendanceScreen from './src/screens/AttendanceScreen';
import AdminScreen from './src/screens/AdminScreen'; // Static Import
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 20, color: '#4B5563' }}>Starting...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }} className="bg-gray-100">
        <StatusBar style="dark" />
        {user ? (
          user.role === 'admin' ? (
            <AdminFlow user={user} onLogout={handleLogout} />
          ) : (
            // Fallback for non-admin users if ever created
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
      onBack={onLogout}
      onLaunchKiosk={() => setView('kiosk')}
    />
  );
}
