import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView
} from 'react-native';
import { useStore } from '../store/MockSupabaseStore';
import { Card, Button, Badge } from '../components/UIComponents';
import {
  Check,
  ArrowLeft,
  Star,
  ShieldCheck,
  Zap,
  Infinity,
  Loader2,
} from 'lucide-react-native';
import { SubscriptionTier } from '../types';
import RazorpayCheckout from '../components/RazorpayCheckout';

interface SubscriptionScreenProps {
  onBack: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY_ID = 'rzp_test_RkLTHtI4AKt7wl';
// Use local IP for Physical Devices/Emulators. CHANGE THIS if your IP changes.
const API_URL = Platform.OS === 'web' ? 'http://localhost:5000' : 'http://172.16.2.33:5000';

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onBack }) => {
  const { user, updateSubscription } = useStore();
  const [processing, setProcessing] = useState<SubscriptionTier | null>(null);

  const handleSubscribe = async (tier: SubscriptionTier, amount: number) => {
    // Platform check REMOVED

    // Check Razorpay on Web
    if (Platform.OS === 'web' && !window.Razorpay) {
      Alert.alert('Error', 'Razorpay SDK not loaded');
      return;
    }

    setProcessing(tier);

    try {
      // 1. Create Order
      const response = await fetch(`${API_URL}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'INR' })
      });
      const order = await response.json();

      if (!order.id) {
        Alert.alert('Error', 'Failed to create order');
        setProcessing(null);
        return;
      }

      // 2. Prepare Options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'PadhoYaar',
        description: `Subscription: ${tier}`,
        order_id: order.id,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#4f46e5' }
      };

      // 3. Handle by Platform
      if (Platform.OS === 'web') {
        const webOptions = {
          ...options,
          handler: async function (response: any) {
            verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature, tier);
          },
          modal: { ondismiss: () => setProcessing(null) }
        };
        const rzp = new window.Razorpay(webOptions);
        rzp.open();
      } else {
        // Native: Store options in state to trigger WebView modal
        setNativeOptions(options);
      }

    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Something went wrong');
      setProcessing(null);
    }
  };

  const verifyPayment = async (orderId: string, paymentId: string, signature: string, tier: SubscriptionTier) => {
    try {
      const verifyReq = await fetch(`${API_URL}/api/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature
        })
      });
      const verifyRes = await verifyReq.json();

      if (verifyRes.success) {
        updateSubscription(tier);
        Alert.alert('Success', `Subscribed to ${tier}`);
        onBack();
      } else {
        Alert.alert('Error', 'Payment verification failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Backend verification failed');
    } finally {
      setProcessing(null);
      setNativeOptions(null);
    }
  };

  const plans = [
    {
      id: 'MONTHLY' as SubscriptionTier,
      name: 'Standard Monthly',
      price: '₹99',
      amount: 99,
      period: '/ month',
      features: [
        'AI Study Plans',
        'Basic Revision Queue',
        'Consistency Tracking',
      ],
      icon: <Zap size={20} color="#6366f1" />,
    },
    {
      id: 'ANNUAL' as SubscriptionTier,
      name: 'Elite Annual',
      price: '₹899',
      amount: 899,
      period: '/ year',
      popular: true,
      features: [
        'Priority AI Generation',
        'Advanced Analytics',
        'Ad-Free Experience',
      ],
      icon: <Star size={20} color="#10b981" />,
    },
    {
      id: 'LIFETIME' as SubscriptionTier,
      name: 'Legendary Lifetime',
      price: '₹2,499',
      amount: 2499,
      period: 'one-time',
      features: [
        'Permanent Access',
        'All Future Updates',
        'VIP Support',
      ],
      icon: <Infinity size={20} color="#f59e0b" />,
    },
  ];

  const [nativeOptions, setNativeOptions] = useState<any>(null);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* NATIVE CHECKOUT MODAL */}
      {Platform.OS !== 'web' && (
        <RazorpayCheckout
          visible={!!nativeOptions}
          options={nativeOptions}
          onClose={() => { setNativeOptions(null); setProcessing(null); }}
          onSuccess={(data) => verifyPayment(data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature, processing!)}
          onFailure={(err) => { Alert.alert('Payment Failed', err.description || 'Cancelled'); setNativeOptions(null); setProcessing(null); }}
        />
      )}
      {/* HEADER */}
      <TouchableOpacity onPress={onBack} style={styles.backRow}>
        <ArrowLeft size={18} color="#94a3b8" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Unlock PadhoYaar Pro</Text>
      <Text style={styles.subtitle}>
        Choose the plan that fits your UPSC preparation pace.
      </Text>

      {/* PLANS */}
      {plans.map(plan => (
        <Card
          key={plan.id}
          style={[
            styles.planCard,
            plan.popular && styles.popular,
          ]}
        >
          {plan.popular && (
            <Badge color="green" style={styles.badge}>
              Best Value
            </Badge>
          )}

          <View style={styles.planHeader}>
            {plan.icon}
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.period}>{plan.period}</Text>
            </View>
          </View>

          <Text style={styles.planName}>{plan.name}</Text>

          {plan.features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Check size={14} color="#22c55e" />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}

          {/* Button Logic: Only disable CURRENT plan. Allow switching/upgrading to others. */}
          <Button
            fullWidth
            size="lg"
            disabled={
              processing !== null ||
              user?.subscription?.tier === plan.id
            }
            onPress={() => handleSubscribe(plan.id, plan.amount)}
            style={
              user?.subscription?.tier === plan.id
                ? { backgroundColor: '#10b981', opacity: 1 } // Active Plan Green
                : plan.id === 'LIFETIME' ? { backgroundColor: '#f59e0b' } : undefined
            }
          >
            {processing === plan.id ? (
              <Loader2 size={18} color="#fff" />
            ) : user?.subscription?.tier === plan.id ? (
              'Active Plan'
            ) : (
              user?.subscription?.tier && user.subscription.tier !== 'FREE_TRIAL' ? 'Switch Plan' : 'Pay & Subscribe'
            )}
          </Button>
        </Card>
      ))}

      {/* FOOTER */}
      <View style={styles.footer}>
        <ShieldCheck size={14} color="#94a3b8" />
        <Text style={styles.footerText}>
          Secure checkout via Razorpay
        </Text>
      </View>
    </ScrollView>
  );
};

export default SubscriptionScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  backText: {
    marginLeft: 8,
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    color: '#64748b',
    marginBottom: 20,
  },
  planCard: {
    padding: 16,
    marginBottom: 16,
  },
  popular: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  badge: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
  },
  period: {
    fontSize: 10,
    color: '#94a3b8',
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    marginLeft: 8,
    color: '#475569',
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    opacity: 0.6,
  },
  footerText: {
    fontSize: 11,
    marginTop: 6,
  },
});
