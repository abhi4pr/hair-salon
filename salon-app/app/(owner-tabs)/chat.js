import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { chatApi } from '../../src/api/chat';
import { PageLoader } from '../../src/components/common/Loader';
import EmptyState from '../../src/components/common/EmptyState';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

export default function OwnerChat() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    chatApi.getConversations().then(res => {
      setConversations(res.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = conversations.filter(c =>
    c.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.salon?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const lastMsg = item.lastMessage;
    const displayName = item.user?.name || item.salon?.name || 'Customer';
    const avatarUrl = item.user?.avatar || item.salon?.images?.[0]?.url;

    return (
      <TouchableOpacity
        style={[styles.item, { borderBottomColor: theme.border }]}
        onPress={() => router.push(`/chat/${item._id}`)}
        activeOpacity={0.7}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.primaryBg }]}>
            <Text style={[styles.avatarInitial, { color: COLORS.primary }]}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.itemInfo}>
          <View style={styles.itemRow}>
            <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={[styles.time, { color: theme.textSecondary }]}>
              {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={[styles.preview, { color: theme.textSecondary }]} numberOfLines={1}>
              {lastMsg?.message || 'Start a conversation'}
            </Text>
            {item.unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.badgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Messages</Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme.inputBg, margin: SPACING.md }]}>
        <Ionicons name="search-outline" size={16} color={theme.icon} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="Search conversations..."
          placeholderTextColor={theme.placeholder}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <PageLoader />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubbles-outline"
              title="No conversations yet"
              subtitle="Customer messages will appear here"
            />
          }
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1 },
  headerTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, height: 42 },
  searchInput: { flex: 1, fontSize: FONT_SIZE.sm },
  item: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1 },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: SPACING.md },
  avatarPlaceholder: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  avatarInitial: { fontSize: FONT_SIZE.lg, fontWeight: '800' },
  itemInfo: { flex: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: FONT_SIZE.md, fontWeight: '700', flex: 1 },
  time: { fontSize: FONT_SIZE.xs },
  preview: { fontSize: FONT_SIZE.sm, flex: 1 },
  badge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
});
