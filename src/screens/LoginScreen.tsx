// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'delivery' | 'operations'>('delivery');

  const handleLogin = async () => {
    const fillEmail = activeRole === 'delivery' ? 'driver@test.com' : 'ops@test.com';
    const useEmail = email.trim() || fillEmail;

    setLoading(true);
    setTimeout(() => {
      const success = login(useEmail, password || '123456');
      setLoading(false);
      if (!success) {
        Alert.alert('Login Failed', 'Invalid credentials. Try driver@test.com / 123456');
        return;
      }
      if (useEmail === 'driver@test.com') {
        navigation.replace('DeliveryDashboard');
      } else {
        navigation.replace('OperationsDashboard');
      }
    }, 800);
  };

  const fillDemo = (role: 'delivery' | 'operations') => {
    setActiveRole(role);
    setEmail(role === 'delivery' ? 'driver@test.com' : 'ops@test.com');
    setPassword('123456');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>🚚</Text>
        </View>
        <Text style={styles.appName}>SwiftRoute</Text>
        <Text style={styles.tagline}>Supply Chain Delivery Tracker</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign In</Text>

        {/* Role Tabs */}
        <View style={styles.roleTabs}>
          <TouchableOpacity
            style={[styles.roleTab, activeRole === 'delivery' && styles.roleTabActive]}
            onPress={() => fillDemo('delivery')}
          >
            <Text style={[styles.roleTabText, activeRole === 'delivery' && styles.roleTabTextActive]}>
              🛵 Delivery
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleTab, activeRole === 'operations' && styles.roleTabActive]}
            onPress={() => fillDemo('operations')}
          >
            <Text style={[styles.roleTabText, activeRole === 'operations' && styles.roleTabTextActive]}>
              📊 Operations
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
          />
        </View>

        {/* Demo hint */}
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>
            Demo: {activeRole === 'delivery' ? 'driver@test.com' : 'ops@test.com'} / 123456
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>Sign In →</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoIcon: { fontSize: 36 },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 20,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleTabActive: {
    backgroundColor: '#f59e0b',
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  roleTabTextActive: {
    color: '#0f172a',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#334155',
  },
  hintBox: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  hintText: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  loginBtn: {
    backgroundColor: '#f59e0b',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
});
