import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import useAuthStore from '../../src/store/authStore';
import { chatApi } from '../../src/api/chat';
import Header from '../../src/components/common/Header';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatConversation() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const user = useAuthStore(s => s.user);
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    chatApi.getMessages(id).then(res => {
      setMessages(res.data.data?.messages || []);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }).catch(() => {});
  }, [id]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const msg = text.trim();
    setText('');
    setSending(true);
    try {
      const res = await chatApi.sendMessage({ conversationId: id, content: msg });
      setMessages(prev => [...prev, res.data.data]);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    } catch {}
    setSending(false);
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender?._id === user?._id || item.senderType === 'user';
    return (
      <View style={[styles.messageWrap, isMine ? styles.myMsgWrap : styles.theirMsgWrap]}>
        <View style={[
          styles.bubble,
          isMine ? [styles.myBubble, { backgroundColor: COLORS.primary }] : [styles.theirBubble, { backgroundColor: theme.card }],
        ]}>
          <Text style={[styles.msgText, { color: isMine ? '#FFF' : theme.textPrimary }]}>{item.content}</Text>
          <Text style={[styles.msgTime, { color: isMine ? 'rgba(255,255,255,0.7)' : theme.textSecondary }]}>
            {new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <Header title="Chat" />
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      <View style={[styles.inputBar, { backgroundColor: theme.background, borderTopColor: theme.border, paddingBottom: insets.bottom + 8 }]}>
        <View style={[styles.inputWrap, { backgroundColor: theme.inputBg }]}>
          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            placeholder="Type a message..."
            placeholderTextColor={theme.placeholder}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: text.trim() ? COLORS.primary : theme.border }]}
          onPress={sendMessage}
          disabled={!text.trim() || sending}
        >
          <Ionicons name="send" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messages: { padding: SPACING.md, gap: SPACING.sm },
  messageWrap: { maxWidth: '75%' },
  myMsgWrap: { alignSelf: 'flex-end' },
  theirMsgWrap: { alignSelf: 'flex-start' },
  bubble: { borderRadius: RADIUS.lg, padding: SPACING.sm },
  myBubble: { borderBottomRightRadius: 4 },
  theirBubble: { borderBottomLeftRadius: 4 },
  msgText: { fontSize: FONT_SIZE.md, lineHeight: 20 },
  msgTime: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, gap: SPACING.sm },
  inputWrap: { flex: 1, borderRadius: RADIUS.xl, paddingHorizontal: SPACING.md, paddingVertical: 8, maxHeight: 120 },
  input: { fontSize: FONT_SIZE.md },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
