import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BottomNav } from '@/components/BottomNav';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useApp } from '@/context/AppContext';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';

export default function JobsScreen() {
  const router = useRouter();
  const { savedJobs } = useApp();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Jobs</Text>
        <TouchableOpacity onPress={() => router.push('/match-job')}>
          <Ionicons name="add-circle-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {savedJobs.length === 0 ? (
          <EmptyState
            icon="briefcase-outline"
            title="No matched jobs yet"
            message="Paste a job description and AI will calculate how well your resume matches."
            action={
              <PrimaryButton
                title="Match a Job"
                onPress={() => router.push('/match-job')}
                style={{ marginTop: Spacing.md, width: '100%' }}
              />
            }
          />
        ) : (
          savedJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => router.push('/match-job')}
            >
              <View style={styles.logo}>
                <Ionicons name="briefcase" size={22} color={Colors.primary} />
              </View>
              <View style={styles.jobInfo}>
                <Text style={styles.company} numberOfLines={2}>{job.title}</Text>
                <Text style={styles.role}>
                  {new Date(job.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{job.matchPercent}%</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  scroll: { flex: 1, paddingHorizontal: Spacing.lg },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    elevation: 2,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  jobInfo: { flex: 1 },
  company: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  role: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  matchBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  matchText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
});
