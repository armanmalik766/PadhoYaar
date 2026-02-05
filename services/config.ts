import { Platform } from 'react-native';

export const API_BASE =
    Platform.OS === 'android'
        ? 'http://192.168.1.11:5000/api'
        : 'http://localhost:5000/api';
