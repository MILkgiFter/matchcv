import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, FontSize } from '@/constants/theme';

interface OutlineButtonProps {
  title: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function OutlineButton({ title, onPress, icon, style }: OutlineButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {icon}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
  },
  text: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
