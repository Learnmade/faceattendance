import React, { useState } from 'react';
import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import { StatusBar } from 'expo-status-bar';
import { API_URL } from '../config';
import { api } from '../services/api';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen({ onLoginSuccess }) {
    // ... (state remains same)
    const [empId, setEmpId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!empId.trim()) {
            Alert.alert("Required", "Please enter ID");
            return;
        }

        setLoading(true);
        try {
            // Use unified API service (handles Offline/Online modes)
            const data = await api.login(empId, password);

            if (data.success) {
                onLoginSuccess(data.user);
            } else {
                Alert.alert("Login Failed", data.message || "Invalid credentials");
            }
        } catch (error) {
            Alert.alert("Error", "Connection failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-slate-900"
        >
            <StatusBar style="light" />
            <SafeAreaView className="flex-1 justify-center px-8">
                <View className="mb-12 items-center">
                    {/* Logo Representation */}
                    <View className="w-24 h-24 bg-green-900/30 rounded-full justify-center items-center mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                        <Text className="text-5xl">🌿</Text>
                    </View>
                    <Text className="text-4xl font-extrabold text-white tracking-tight text-center">
                        Greenleaf
                    </Text>
                    <Text className="text-green-500 font-semibold tracking-widest uppercase mt-2 text-xs">
                        Access Control System
                    </Text>
                </View>

                <View className="space-y-4 w-full max-w-sm mx-auto">
                    <View>
                        <Text className="text-slate-400 font-medium mb-2 ml-1 text-xs uppercase">Employee ID / Username</Text>
                        <TextInput
                            className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-lg text-white focus:border-green-500 focus:bg-slate-800 transition-all placeholder:text-slate-600"
                            placeholder="Enter ID"
                            placeholderTextColor="#475569"
                            value={empId}
                            onChangeText={setEmpId}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View>
                        <Text className="text-slate-400 font-medium mb-2 ml-1 text-xs uppercase">Password (Admin Only)</Text>
                        <TextInput
                            className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-lg text-white focus:border-green-500 focus:bg-slate-800 transition-all placeholder:text-slate-600"
                            placeholder="Optional for Employees"
                            placeholderTextColor="#475569"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <PrimaryButton
                        title={loading ? "Verifying..." : "Sign In →"}
                        onPress={handleLogin}
                        disabled={loading}
                        className="shadow-lg shadow-green-900/20 mt-4 bg-green-600 active:bg-green-500"
                    />
                </View>

                <View className="absolute bottom-10 left-0 right-0 items-center">
                    <Text className="text-slate-600 text-xs font-medium">
                        Powered by Greenleaf Intelligence
                    </Text>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}
