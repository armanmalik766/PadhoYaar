
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal as RNModal,
  ScrollView,
  Platform
} from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';


export const Button = ({ children, variant = 'primary', size = 'md', fullWidth = false, onPress, onClick, disabled, style }: any) => {
  const buttonStyles = [
    styles.btnBase,
    variant === 'primary' ? styles.btnPrimary : variant === 'danger' ? styles.btnDanger : styles.btnSecondary,
    variant === 'outline' && styles.btnOutline,
    variant === 'ghost' && styles.btnGhost,
    fullWidth && styles.btnFull,
    disabled && styles.btnDisabled,
    style
  ];

  const handlePress = onPress || onClick;

  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled} style={buttonStyles}>
      <Text style={[styles.btnText, (variant === 'outline' || variant === 'ghost') && { color: '#475569' }]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export const Card = ({ children, style, onPress, onClick }: any) => {
  const handlePress = onPress || onClick;

  if (handlePress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        style={[styles.card, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

export const Input = ({ label, value, onChangeText, placeholder, autoFocus, ...props }: any) => (
  <View style={styles.inputGroup}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      autoFocus={autoFocus}
      {...props}
    />
  </View>
);

export const Select = ({ label, value, onChange, options, style }: any) => {
  const [showPicker, setShowPicker] = useState(false);
  const selectedOption = options.find((opt: any) => opt.value === value);

  return (
    <View style={[styles.inputGroup, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.selectTrigger}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.selectText}>
          {selectedOption ? selectedOption.label : 'Select...'}
        </Text>
        <ChevronDown size={20} color="#64748b" />
      </TouchableOpacity>

      <RNModal visible={showPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.pickerContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Choose Option'}</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {options.map((opt: any) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.optionItem,
                    value === opt.value && styles.optionItemActive
                  ]}
                  onPress={() => {
                    onChange({ target: { value: opt.value } });
                    setShowPicker(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    value === opt.value && styles.optionTextActive
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </RNModal>
    </View>
  );
};

export const Badge = ({ children, color = 'gray', style }: any) => {
  const badgeColors: any = {
    gray: { bg: '#f1f5f9', text: '#64748b' },
    indigo: { bg: '#e0e7ff', text: '#4338ca' },
    blue: { bg: '#dbeafe', text: '#1d4ed8' },
    green: { bg: '#dcfce7', text: '#15803d' },
    red: { bg: '#fee2e2', text: '#b91c1c' },
    amber: { bg: '#fef3c7', text: '#b45309' },
  };
  const theme = badgeColors[color] || badgeColors.gray;
  return (
    <View style={[styles.badge, { backgroundColor: theme.bg }, style]}>
      <Text style={[styles.badgeText, { color: theme.text }]}>{children}</Text>
    </View>
  );
};

export const Modal = ({ isOpen, onClose, title, children }: any) => (
  <RNModal visible={isOpen} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
        <View style={styles.modalBody}>
          {children}
        </View>
      </View>
    </View>
  </RNModal>
);

const styles = StyleSheet.create({
  btnBase: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  btnPrimary: { backgroundColor: '#0f172a' },
  btnSecondary: { backgroundColor: '#4f46e5' },
  btnDanger: { backgroundColor: '#ef4444' },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e2e8f0' },
  btnGhost: { backgroundColor: 'transparent' },
  btnFull: { width: '100%' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  selectTrigger: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { fontSize: 16, color: '#0f172a' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: '50%',
  },
  pickerContent: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  modalBody: { flex: 1 },
  optionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  optionItemActive: {
    backgroundColor: '#f8fafc',
  },
  optionText: { fontSize: 16, color: '#334155' },
  optionTextActive: { fontWeight: '700', color: '#4f46e5' },
});
