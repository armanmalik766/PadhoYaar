import React, { useRef } from 'react';
import { Modal, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { X } from 'lucide-react-native';

interface RazorpayCheckoutProps {
    visible: boolean;
    onClose: () => void;
    options: any;
    onSuccess: (data: any) => void;
    onFailure: (error: any) => void;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
    visible,
    onClose,
    options,
    onSuccess,
    onFailure
}) => {
    const webViewRef = useRef<WebView>(null);

    if (!visible || !options) return null;

    // Generate HTML
    const razorpayHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment</title>
      <style>
        body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: white; }
      </style>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </head>
    <body>
      <script>
        const options = ${JSON.stringify(options)};
        options.handler = function (response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SUCCESS', data: response }));
        };
        options.modal = {
          ondismiss: function () {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DISMISS' }));
          }
        };
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response){
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FAILURE', data: response.error }));
        });
        rzp.open();
      </script>
    </body>
    </html>
  `;

    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Secure Payment</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <X size={24} color="#000" />
                    </TouchableOpacity>
                </View>
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: razorpayHTML }}
                    javaScriptEnabled={true}
                    onMessage={(event) => {
                        const message = JSON.parse(event.nativeEvent.data);
                        if (message.type === 'SUCCESS') {
                            onSuccess(message.data);
                        } else if (message.type === 'FAILURE') {
                            onFailure(message.data);
                        } else if (message.type === 'DISMISS') {
                            onClose();
                        }
                    }}
                    startInLoadingState={true}
                    renderLoading={() => <ActivityIndicator size="large" color="#4f46e5" style={styles.loader} />}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        marginTop: 40 // Safe area
    },
    title: { fontSize: 18, fontWeight: '700' },
    closeBtn: { padding: 8 },
    loader: { position: 'absolute', top: '50%', left: '50%', zIndex: 99 }
});

export default RazorpayCheckout;
