import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Colors, FontSize } from '@/constants/theme';

export function ApiBanner() {
  const { apiOnline } = useApp();

  if (apiOnline) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="server-outline" size={16} color={Colors.white} />
      <Text style={styles.text}>
        Backend offline — run npm run backend:dev and set GROQ_API_KEY
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#B45309',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    flex: 1,
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
