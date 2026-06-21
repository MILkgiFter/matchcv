import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { BottomNav } from '@/components/BottomNav';
import { PremiumLockCard } from '@/components/PremiumLockCard';
import { useApp } from '@/context/AppContext';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { sendChatMessage } from '@/services/chat';
import { FREE_LIMITS } from '@/constants/limits';
import type { ChatMessage } from '@/types/api';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';

const promptKeys = ['prompt1', 'prompt2', 'prompt3'] as const;

export default function ChatScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { chatMessages, addChatMessage, localAiReady } = useApp();
  const { gate, recordUsage, isPremium, remaining, openPaywall } = usePremiumGate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSource, setLastSource] = useState<'local' | 'cloud' | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;

    if (!gate('chat', 'chat')) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      createdAt: Date.now(),
    };

    addChatMessage(userMsg);
    setMessage('');
    setLoading(true);

    try {
      const { reply, source } = await sendChatMessage(text.trim(), [...chatMessages, userMsg]);
      await recordUsage('chat');
      setLastSource(source);
      addChatMessage({
        id: `${Date.now()}-bot`,
        role: 'assistant',
        content: reply,
        createdAt: Date.now(),
      });
    } catch (error) {
      Alert.alert(
        t('chat.aiUnavailable'),
        error instanceof Error ? error.message : t('chat.localModel'),
        [
          { text: t('chat.localModel'), onPress: () => router.push('/ai-model') },
          { text: t('common.ok') },
        ],
      );
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('chat.title')}</Text>
          <Text style={styles.sourceBadge}>
            {localAiReady
              ? t('chat.onDevice')
              : isPremium
                ? t('chat.premiumUnlimited')
                : t('chat.messagesToday', {
                    remaining: remaining('chat'),
                    limit: FREE_LIMITS.chatMessagesPerDay,
                  })}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/ai-model')}>
          <Ionicons name="download-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.length === 0 && (
            <>
              <View style={styles.botMessage}>
                <View style={styles.avatar}>
                  <Ionicons name="hardware-chip" size={24} color={Colors.primary} />
                </View>
                <View style={styles.bubble}>
                  <Text style={styles.bubbleText}>{t('chat.welcome')}</Text>
                </View>
              </View>
              <Text style={styles.suggestionsTitle}>{t('chat.suggestions')}</Text>
              {promptKeys.map((key) => (
                <TouchableOpacity key={key} style={styles.promptChip} onPress={() => send(t(`chat.${key}`))}>
                  <Text style={styles.promptText}>{t(`chat.${key}`)}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {chatMessages.map((msg) => (
            <View
              key={msg.id}
              style={msg.role === 'user' ? styles.userMessage : styles.botMessage}
            >
              {msg.role === 'assistant' && (
                <View style={styles.avatar}>
                  <Ionicons name="hardware-chip" size={24} color={Colors.primary} />
                </View>
              )}
              <View style={[styles.bubble, msg.role === 'user' && styles.userBubble]}>
                <Text style={[styles.bubbleText, msg.role === 'user' && styles.userBubbleText]}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 8 }} />}

          {!isPremium && remaining('chat') === 0 && (
            <PremiumLockCard
              title={t('premium.sources.chat.title')}
              subtitle={t('premium.sources.chat.subtitle')}
              onUnlock={() => openPaywall('chat')}
            />
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={Colors.textMuted}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={() => send(message)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, loading && { opacity: 0.5 }]}
            onPress={() => send(message)}
            disabled={loading}
          >
            <Ionicons name="send" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  sourceBadge: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  chatArea: { flex: 1 },
  chatContent: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  botMessage: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  userMessage: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: Spacing.md },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  bubble: {
    flex: 1, maxWidth: '85%', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, borderTopLeftRadius: 4, padding: Spacing.md,
  },
  userBubble: { backgroundColor: Colors.primary, borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: 4 },
  bubbleText: { fontSize: FontSize.md, color: Colors.text, lineHeight: 22 },
  userBubbleText: { color: Colors.white },
  suggestionsTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  promptChip: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 12, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  promptText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '500' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white,
  },
  input: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: FontSize.md, color: Colors.text,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
});
