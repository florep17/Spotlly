import { Alert, Platform } from 'react-native';

export function showMessage(title: string, message: string, onClose?: () => void) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    onClose?.();
    return;
  }
  Alert.alert(title, message, [{ text: 'OK', onPress: onClose }]);
}

export function confirmAction(title: string, message: string, action: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) action();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Anuluj', style: 'cancel' },
    { text: 'Potwierdź', style: 'destructive', onPress: action },
  ]);
}
