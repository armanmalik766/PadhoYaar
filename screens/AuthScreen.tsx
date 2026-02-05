import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard
} from 'react-native';
import { useStore } from '../store/MockSupabaseStore';
import { ShieldCheck, Loader2, Mail, User as UserIcon, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const AuthScreen = () => {
  const { loginWithEmail, isLoading, t } = useStore();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(false); // Toggle state

  const handleLogin = async () => {
    // If registering, name is required. If logging in, name is optional (we can pass placeholder)
    if (!isLogin && !name.trim()) {
      setError("Please enter your name to register");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!email.includes('@')) {
      setError("Please enter a valid email");
      return;
    }
    setError('');
    Keyboard.dismiss();

    // Pass placeholder name if logging in, backend should handle existing user update
    const submitName = name.trim();

    try {
      await loginWithEmail(email, submitName, isLogin);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        <View style={styles.content}>
          <View style={styles.headerSection}>
            <View style={styles.iconBox}>
              <ShieldCheck size={40} color="#fff" />
            </View>
            <Text style={styles.title}>PadhoYaar</Text>
            <Text style={styles.subtitle}>{t('app_tagline')}</Text>
          </View>

          {/* Toggle Switch */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, !isLogin && styles.toggleBtnActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>SignUp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, isLogin && styles.toggleBtnActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formTitle}>{isLogin ? 'Welcome Back' : 'Get Started'}</Text>

            {/* Name Input - Only for Register */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <UserIcon size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  placeholder="Your Name"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Mail size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginBtn}
            >
              {isLoading ? (
                <Loader2 size={24} color="#fff" style={{ transform: [{ rotate: '0deg' }] }} />
              ) : (
                <>
                  <Text style={styles.btnText}>{isLogin ? 'Login' : 'Create Account'}</Text>
                  <ArrowRight size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Trusted by Aspirants</Text>
            <View style={styles.line} />
          </View>

          <Text style={styles.footerText}>
            By continuing, you agree to our Terms. Your data is synced securely.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20
  },
  content: {
    width: width > 500 ? 450 : width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 10
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24
  },
  iconBox: {
    padding: 16,
    backgroundColor: '#4f46e5',
    borderRadius: 20,
    marginBottom: 16,
    transform: [{ rotate: '6deg' }],
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4
  },
  formSection: {
    width: '100%',
    marginBottom: 24
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 16,
    alignSelf: 'flex-start'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  inputIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0f172a'
  },
  loginBtn: {
    width: '100%',
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center'
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%'
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  dividerText: {
    paddingHorizontal: 12,
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
  blob1: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
  },
  blob2: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    width: '100%'
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  toggleBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b'
  },
  toggleTextActive: {
    color: '#0f172a',
    fontWeight: '700'
  }
});

export default AuthScreen;
