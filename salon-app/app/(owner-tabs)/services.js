import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Modal,
  TextInput, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../src/context/ThemeContext';
import { ownerApi } from '../../src/api/owner';
import { PageLoader } from '../../src/components/common/Loader';
import EmptyState from '../../src/components/common/EmptyState';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

const EMPTY_FORM = { name: '', price: '', duration: '', category: '', description: '' };

export default function OwnerServices() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ownerApi.getMyServices();
      setServices(res.data.data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImage(null);
    setModalVisible(true);
  };

  const openEdit = (service) => {
    setEditing(service);
    setForm({
      name: service.name || '',
      price: String(service.price || ''),
      duration: String(service.duration || ''),
      category: service.category || '',
      description: service.description || '',
    });
    setImage(null);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.duration) {
      Toast.show({ type: 'error', text1: 'Name, price and duration are required' });
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('price', form.price);
      fd.append('duration', form.duration);
      fd.append('category', form.category);
      fd.append('description', form.description);
      if (image) {
        fd.append('image', { uri: image.uri, type: 'image/jpeg', name: 'service.jpg' });
      }

      if (editing) {
        await ownerApi.updateService(editing._id, fd);
        Toast.show({ type: 'success', text1: 'Service updated' });
      } else {
        await ownerApi.createService(fd);
        Toast.show({ type: 'success', text1: 'Service added' });
      }
      setModalVisible(false);
      fetchServices();
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to save service' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (service) => {
    Alert.alert('Delete Service', `Delete "${service.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await ownerApi.deleteService(service._id);
            Toast.show({ type: 'success', text1: 'Service deleted' });
            fetchServices();
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to delete service' });
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
      {item.image?.url ? (
        <Image source={{ uri: item.image.url }} style={styles.serviceImage} />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: COLORS.primaryBg }]}>
          <Ionicons name="cut-outline" size={28} color={COLORS.primary} />
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={[styles.serviceName, { color: theme.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.serviceCategory, { color: theme.textSecondary }]}>{item.category || 'General'}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.pill, { backgroundColor: COLORS.primaryBg }]}>
            <Text style={[styles.pillText, { color: COLORS.primary }]}>₹{item.price}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: theme.surface }]}>
            <Ionicons name="time-outline" size={12} color={theme.icon} />
            <Text style={[styles.pillText, { color: theme.textSecondary }]}>{item.duration} min</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surface }]} onPress={() => openEdit(item)}>
          <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#FFF0F0' }]} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>My Services</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: COLORS.primary }]} onPress={openAdd}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <PageLoader />
      ) : (
        <FlatList
          data={services}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { flexGrow: 1 }]}
          ListEmptyComponent={
            <EmptyState
              icon="cut-outline"
              title="No services yet"
              subtitle="Tap Add to create your first service"
            />
          }
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                {editing ? 'Edit Service' : 'New Service'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.icon} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Image picker */}
              <TouchableOpacity style={[styles.imagePicker, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image.uri }} style={styles.pickedImage} />
                ) : editing?.image?.url ? (
                  <Image source={{ uri: editing.image.url }} style={styles.pickedImage} />
                ) : (
                  <View style={styles.imagePickerInner}>
                    <Ionicons name="camera-outline" size={28} color={theme.icon} />
                    <Text style={[styles.imagePickerText, { color: theme.textSecondary }]}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              {[
                { key: 'name', label: 'Service Name', placeholder: 'e.g. Haircut' },
                { key: 'price', label: 'Price (₹)', placeholder: 'e.g. 300', keyboardType: 'numeric' },
                { key: 'duration', label: 'Duration (minutes)', placeholder: 'e.g. 30', keyboardType: 'numeric' },
                { key: 'category', label: 'Category', placeholder: 'e.g. Hair, Skin, Nails' },
                { key: 'description', label: 'Description', placeholder: 'Short description...', multiline: true },
              ].map(field => (
                <View key={field.key} style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{field.label}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border },
                      field.multiline && { height: 80, textAlignVertical: 'top' },
                    ]}
                    placeholder={field.placeholder}
                    placeholderTextColor={theme.placeholder}
                    value={form[field.key]}
                    onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                    keyboardType={field.keyboardType}
                    multiline={field.multiline}
                  />
                </View>
              ))}

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: COLORS.primary, opacity: saving ? 0.7 : 1 }]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : editing ? 'Update Service' : 'Add Service'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: RADIUS.full },
  addBtnText: { color: '#FFF', fontSize: FONT_SIZE.sm, fontWeight: '700' },
  list: { padding: SPACING.md, gap: SPACING.md },
  card: {
    flexDirection: 'row', borderRadius: RADIUS.xl, shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 2, overflow: 'hidden', alignItems: 'center',
  },
  serviceImage: { width: 80, height: 80 },
  imagePlaceholder: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, padding: SPACING.md },
  serviceName: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  serviceCategory: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.xs },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  pillText: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
  cardActions: { flexDirection: 'column', gap: SPACING.xs, padding: SPACING.sm },
  iconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, maxHeight: '92%' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1,
  },
  modalTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700' },
  modalBody: { padding: SPACING.md, gap: SPACING.md, paddingBottom: SPACING.xxl },
  imagePicker: {
    height: 120, borderRadius: RADIUS.xl, borderWidth: 1, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  pickedImage: { width: '100%', height: '100%' },
  imagePickerInner: { alignItems: 'center', gap: 6 },
  imagePickerText: { fontSize: FONT_SIZE.sm },
  fieldWrap: { gap: 4 },
  fieldLabel: { fontSize: FONT_SIZE.sm, fontWeight: '500' },
  input: { borderRadius: RADIUS.lg, borderWidth: 1, paddingHorizontal: SPACING.md, paddingVertical: 10, fontSize: FONT_SIZE.md },
  saveBtn: { paddingVertical: 14, borderRadius: RADIUS.full, alignItems: 'center', marginTop: SPACING.sm },
  saveBtnText: { color: '#FFF', fontSize: FONT_SIZE.md, fontWeight: '700' },
});
