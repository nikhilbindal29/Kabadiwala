import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../src/components/ui/ScreenWrapper';
import { Input } from '../src/components/ui/Input';
import { Button } from '../src/components/ui/Button';
import { Colors } from '../src/constants/colors';
import { authService } from '../src/services/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep] = useState<'REQUEST' | 'RESET'>('REQUEST');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState('');

  const handleRequestOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      if (res.dev_otp) {
        setDevOtpHint(res.dev_otp);
        setOtp(res.dev_otp);
      }
      setStep('RESET');
      Alert.alert('Code Sent', 'Please check your email or development console for your OTP code.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to request reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword) {
      Alert.alert('Error', 'Please enter both the reset code and new password.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(email.trim(), otp.trim(), newPassword);
      Alert.alert('Success', 'Password has been reset successfully! Please sign in.', [
        { text: 'Sign In', onPress: () => router.replace('/login') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {step === 'REQUEST'
              ? 'Enter your registered email to receive a password reset code.'
              : 'Enter the code and choose a new password.'}
          </Text>
        </View>

        {!!devOtpHint && (
          <View style={styles.devHintBox}>
            <Text style={styles.devHintText}>Development Mode OTP: {devOtpHint}</Text>
          </View>
        )}

        {step === 'REQUEST' ? (
          <>
            <Input
              label="Registered Email"
              placeholder="e.g. user@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              title="Send Reset Code"
              onPress={handleRequestOtp}
              loading={loading}
              size="large"
              style={styles.btn}
            />
          </>
        ) : (
          <>
            <Input
              label="6-Digit Reset Code"
              placeholder="123456"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
            />
            <Input
              label="New Password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChangeText={setNewPassword}
              isPassword
            />
            <Button
              title="Update Password"
              onPress={handleResetPassword}
              loading={loading}
              size="large"
              style={styles.btn}
            />
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  backBtn: {
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 22,
  },
  devHintBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  devHintText: {
    color: Colors.primaryDark,
    fontWeight: 'bold',
    fontSize: 14,
  },
  btn: {
    marginTop: 10,
  },
});

