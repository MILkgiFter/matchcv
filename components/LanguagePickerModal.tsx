import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_OPTIONS } from '@/i18n/languages';
import { getAppLocale, setAppLocale, type AppLocale } from '@/i18n';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function LanguagePickerModal({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const current = getAppLocale();

  const select = async (code: AppLocale) => {
    await setAppLocale(code);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('profile.language')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {LANGUAGE_OPTIONS.map(({ code, flag }) => {
              const active = current === code;
              return (
                <TouchableOpacity
                  key={code}
                  style={[styles.row, active && styles.rowActive]}
                  onPress={() => select(code)}
                >
                  <Text style={styles.flag}>{flag}</Text>
                  <Text style={[styles.label, active && styles.labelActive]}>
                    {t(`languages.${code}`)}
                  </Text>
                  {active && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '70%',
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  rowActive: { backgroundColor: Colors.primaryLight },
  flag: { fontSize: 22 },
  label: { flex: 1, fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  labelActive: { color: Colors.primary },
});
