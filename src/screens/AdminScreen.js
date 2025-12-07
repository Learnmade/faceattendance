import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Alert, ScrollView, Modal, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { API_URL } from '../config';
import { api } from '../services/api';
import { StatusBar } from 'expo-status-bar';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminScreen({ onBack, onLaunchKiosk }) {
    // ... (state remains same)
    const [name, setName] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [department, setDepartment] = useState('');
    const [faceImage, setFaceImage] = useState(null);
    const [cameraVisible, setCameraVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);

    const handleRegister = async () => {
        if (!name || !employeeId || !department || !faceImage) {
            Alert.alert("Missing Fields", "Please fill all fields and capture a face photo.");
            return;
        }

        setLoading(true);
        try {
            // Updated to use Unified API
            const result = await api.register({
                name,
                employeeId,
                department,
                faceImage
            });

            if (result.success) {
                Alert.alert("Success", "Employee Registered Successfully!");
                setName('');
                setEmployeeId('');
                setDepartment('');
                setFaceImage(null);
            } else {
                Alert.alert("Error", result.message || "Registration failed");
            }
        } catch (error) {
            Alert.alert("Error", "Network disconnect. Check server.");
        } finally {
            setLoading(false);
        }
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
            setFaceImage(photo.base64);
            setCameraVisible(false);
        }
    };

    const downloadReport = () => {
        Linking.openURL("https://docs.google.com/spreadsheets/u/0/");
        Alert.alert("Redirecting", "Opening Google Sheets...");
    };

    if (!permission) return <SafeAreaView className="flex-1 bg-slate-900" />;
    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center p-8 bg-slate-900">
                <Text className="text-xl font-bold mb-4 text-white">Camera Permission Needed</Text>
                <PrimaryButton onPress={requestPermission} title="Grant Permission" />
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-slate-900">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="pt-2 pb-6 px-6 border-b border-slate-700 shadow-sm flex-row justify-between items-center bg-slate-800">
                    <View>
                        <Text className="text-xs font-bold text-green-500 uppercase tracking-widest">Administrator</Text>
                        <Text className="text-2xl font-bold text-white">Control Panel</Text>
                    </View>
                    <TouchableOpacity onPress={onBack} className="bg-slate-700 p-2 rounded-full border border-slate-600">
                        <Text className="text-slate-300 font-bold px-2">✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                    {/* Kiosk Card */}
                    <View className="bg-green-700 p-6 rounded-2xl shadow-lg shadow-green-900/50 mb-8 overflow-hidden relative border border-green-600">
                        <View className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full" />
                        <Text className="text-white font-bold text-lg mb-1">Station Mode</Text>
                        <Text className="text-green-100 mb-6 w-3/4">Launch the dedicated face attendance kiosk for employees.</Text>
                        <PrimaryButton
                            title="Launch Kiosk"
                            onPress={onLaunchKiosk}
                            className="bg-white"
                            textClassName="text-green-700"
                        />
                    </View>

                    {/* Registration Form */}
                    <View className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm mb-6">
                        <Text className="text-white font-bold text-lg mb-6">Register Employee</Text>

                        <View className="space-y-4">
                            <View>
                                <Text className="text-slate-400 font-medium mb-1.5 ml-1 text-xs uppercase">Employee ID</Text>
                                <TextInput
                                    className="bg-slate-700 border border-slate-600 p-3.5 rounded-xl text-white placeholder:text-slate-500"
                                    value={employeeId}
                                    onChangeText={setEmployeeId}
                                    placeholder="ex. EMP01"
                                    placeholderTextColor="#64748b"
                                />
                            </View>

                            <View>
                                <Text className="text-slate-400 font-medium mb-1.5 ml-1 text-xs uppercase">Full Name</Text>
                                <TextInput
                                    className="bg-slate-700 border border-slate-600 p-3.5 rounded-xl text-white placeholder:text-slate-500"
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="ex. Sarah Smith"
                                    placeholderTextColor="#64748b"
                                />
                            </View>

                            <View>
                                <Text className="text-slate-400 font-medium mb-1.5 ml-1 text-xs uppercase">Department</Text>
                                <TextInput
                                    className="bg-slate-700 border border-slate-600 p-3.5 rounded-xl text-white placeholder:text-slate-500"
                                    value={department}
                                    onChangeText={setDepartment}
                                    placeholder="ex. Engineering"
                                    placeholderTextColor="#64748b"
                                />
                            </View>

                            <View className="mt-2">
                                <Text className="text-slate-400 font-medium mb-2 ml-1 text-xs uppercase">Biometric Data</Text>
                                {faceImage ? (
                                    <View className="flex-row items-center justify-between bg-green-900/30 border border-green-800 p-3 rounded-xl">
                                        <Text className="text-green-400 font-bold ml-2">Face Captured</Text>
                                        <SecondaryButton title="Retake" onPress={() => setCameraVisible(true)} className="bg-slate-700 py-1.5 px-3 min-w-0 border-0" textClassName="text-sm text-white" />
                                    </View>
                                ) : (
                                    <SecondaryButton
                                        title="Capture Face Photo"
                                        onPress={() => setCameraVisible(true)}
                                        className="border-dashed border-2 border-slate-600 bg-slate-800/50"
                                        textClassName="text-slate-400"
                                    />
                                )}
                            </View>
                        </View>

                        <View className="mt-8">
                            {loading ? (
                                <ActivityIndicator size="large" color="#22c55e" />
                            ) : (
                                <PrimaryButton title="Register Employee" onPress={handleRegister} className="shadow-lg shadow-green-900/50 bg-green-600" />
                            )}
                        </View>
                    </View>

                    {/* Sheets Link */}
                    <SecondaryButton
                        title="View Database (Google Sheets) ↗"
                        onPress={downloadReport}
                        className="mb-12 border border-slate-700 bg-slate-800"
                        textClassName="text-slate-300"
                    />
                </ScrollView>
            </SafeAreaView>

            <Modal visible={cameraVisible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-black">
                    <CameraView style={{ flex: 1 }} facing="front" ref={cameraRef}>
                        <SafeAreaView className="flex-1 justify-end pb-10 px-6">
                            <Text className="text-white text-center text-xl font-bold mb-8">
                                Center Face in Frame
                            </Text>
                            <View className="flex-row gap-4 mb-4">
                                <SecondaryButton title="Cancel" onPress={() => setCameraVisible(false)} className="flex-1 bg-white/20 border-0" textClassName="text-white" />
                                <PrimaryButton title="Take Photo" onPress={takePicture} className="flex-1 bg-green-600" />
                            </View>
                        </SafeAreaView>
                    </CameraView>
                </View>
            </Modal>
        </View>
    );
}
