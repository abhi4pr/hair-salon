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

const CATEGORY_COLORS = {
  Hair: '#6366F1',
  Skin: '#EC4899',
  Nails: '#F59E0B',
  Massage: '#22C55E',
  Makeup: '#8B5CF6',
  General: COLORS.primary,
};

function getCategoryColor(cat) {
  return CATEGORY_COLORS[cat] || COLORS.primary;
}

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

  const renderItem = ({ item }) => {
    const catColor = getCategoryColor(item.category);
    return (
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
        {/* Image / placeholder */}
        <View style={styles.cardImageWrap}>
          {item.image?.url ? (
            <Image source={{ uri: item.image.url }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImagePlaceholder, { backgroundColor: catColor + '18' }]}>
              <Ionicons name="cut-outline" size={32} color={catColor} />
            </View>
          )}
          <View style={[styles.categoryTag, { backgroundColor: catColor }]}>
            <Text style={styles.categoryTagText}>{item.category || 'General'}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.cardContent}>
          <Text style={[styles.serviceName, { color: theme.textPrimary }]} numberOfLines={1}>
            {item.name}
          </Text>

          {item.description ? (
            <Text style={[styles.serviceDesc, { color: theme.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <View style={[styles.metaPill, { backgroundColor: COLORS.primaryBg }]}>
              <Ionicons name="pricetag-outline" size={11} color={COLORS.primary} />
              <Text style={[styles.metaPillText, { color: COLORS.primary }]}>₹{item.price}</Text>
            </View>
            <View style={[styles.metaPill, { backgroundColor: theme.surface }]}>
              <Ionicons name="time-outline" size={11} color={theme.icon} />
              <Text style={[styles.metaPillText, { color: theme.textSecondary }]}>{item.duration} min</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.primaryBg }]}
            onPress={() => openEdit(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil-outline" size={15} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#FFF0F0' }]}
            onPress={() => handleDelete(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={15} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>My Services</Text>
          {!loading && (
            <Text style={[styles.headerCount, { color: theme.textSecondary }]}>
              {services.length} {services.length === 1 ? 'service' : 'services'}
            </Text>
          )}
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: COLORS.primary }]} onPress={openAdd} activeOpacity={0.8}>
          <Ionicons name="add" size={18} color="#FFF" />
          <Text style={styles.addBtnText}>Add Service</Text>
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
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="cut-outline"
              title="No services yet"
              subtitle="Tap Add Service to create your first service"
            />
          }
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.background }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View style={[styles.modalDragBar, { backgroundColor: theme.border }]} />
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                {editing ? 'Edit Service' : 'New Service'}
              </Text>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: theme.surface }]}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={18} color={theme.icon} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Image Picker */}
              <TouchableOpacity
                style={[styles.imagePicker, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                {image ? (
                  <Image source={{ uri: image.uri }} style={styles.pickedImage} />
                ) : editing?.image?.url ? (
                  <Image source={{ uri: editing.image.url }} style={styles.pickedImage} />
                ) : (
                  <View style={styles.imagePickerInner}>
                    <View style={[styles.imagePickerIconWrap, { backgroundColor: COLORS.primaryBg }]}>
                      <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
                    </View>
                    <Text style={[styles.imagePickerTitle, { color: theme.textPrimary }]}>Add Photo</Text>
                    <Text style={[styles.imagePickerSub, { color: theme.textSecondary }]}>Tap to choose from gallery</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Form Fields */}
              <View style={[styles.formSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {[
                  { key: 'name', label: 'Service Name', placeholder: 'e.g. Haircut', icon: 'cut-outline' },
                  { key: 'price', label: 'Price (₹)', placeholder: 'e.g. 300', icon: 'pricetag-outline', keyboardType: 'numeric' },
                  { key: 'duration', label: 'Duration (min)', placeholder: 'e.g. 30', icon: 'time-outline', keyboardType: 'numeric' },
                  { key: 'category', label: 'Category', placeholder: 'e.g. Hair, Skin, Nails', icon: 'grid-outline' },
                ].map((field, idx, arr) => (
                  <View
                    key={field.key}
                    style={[styles.fieldRow, idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
                  >
                    <View style={[styles.fieldIcon, { backgroundColor: COLORS.primaryBg }]}>
                      <Ionicons name={field.icon} size={15} color={COLORS.primary} />
                    </View>
                    <View style={styles.fieldContent}>
                      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{field.label}</Text>
                      <TextInput
                        style={[styles.fieldInput, { color: theme.textPrimary }]}
                        placeholder={field.placeholder}
                        placeholderTextColor={theme.placeholder}
                        value={form[field.key]}
                        onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                        keyboardType={field.keyboardType}
                      />
                    </View>
                  </View>
                ))}
              </View>

              {/* Description */}
              <View style={[styles.descSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.descLabel, { color: theme.textSecondary }]}>Description</Text>
                <TextInput
                  style={[styles.descInput, { color: theme.textPrimary }]}
                  placeholder="Short description of the service..."
                  placeholderTextColor={theme.placeholder}
                  value={form.description}
                  onChangeText={v => setForm(f => ({ ...f, description: v }))}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: COLORS.primary, opacity: saving ? 0.75 : 1 }]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving
                  ? <Text style={styles.saveBtnText}>Saving...</Text>
                  : <>
                      <Ionicons name={editing ? 'checkmark-outline' : 'add-outline'} size={18} color="#FFF" />
                      <Text style={styles.saveBtnText}>{editing ? 'Update Service' : 'Add Service'}</Text>
                    </>
                }
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
  headerCount: { fontSize: FONT_SIZE.sm, marginTop: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING.md, paddingVertical: 9, borderRadius: RADIUS.full },
  addBtnText: { color: '#FFF', fontSize: FONT_SIZE.sm, fontWeight: '700' },

  list: { padding: SPACING.md, gap: SPACING.md },

  card: {
    borderRadius: RADIUS.xl, shadowOpacity: 0.07, shadowRadius: 10,
    elevation: 3, overflow: 'hidden',
  },
  cardImageWrap: { position: 'relative', height: 140 },
  cardImage: { width: '100%', height: '100%' },
  cardImagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  categoryTag: {
    position: 'absolute', top: SPACING.sm, left: SPACING.sm,
    paddingHorizontal: 9, paddingVertical: 3, borderRadius: RADIUS.full,
  },
  categoryTagText: { color: '#FFF', fontSize: 10, fontWeight: '700' },

  cardContent: { padding: SPACING.md, paddingBottom: SPACING.sm },
  serviceName: { fontSize: FONT_SIZE.lg, fontWeight: '800' },
  serviceDesc: { fontSize: FONT_SIZE.sm, marginTop: 4, lineHeight: 18 },
  metaRow: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.sm },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: RADIUS.full },
  metaPillText: { fontSize: FONT_SIZE.xs, fontWeight: '600' },

  cardActions: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, paddingTop: SPACING.xs },
  actionBtn: { flex: 1, height: 40, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '94%' },
  modalHeader: {
    alignItems: 'center', paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm, paddingBottom: SPACING.md, borderBottomWidth: 1,
  },
  modalDragBar: { width: 36, height: 4, borderRadius: 2, marginBottom: SPACING.sm },
  modalTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800' },
  modalCloseBtn: {
    position: 'absolute', right: SPACING.md, top: SPACING.md + 6,
    width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
  },

  modalBody: { padding: SPACING.md, gap: SPACING.md, paddingBottom: SPACING.xxl },

  imagePicker: {
    height: 130, borderRadius: RADIUS.xl, borderWidth: 1.5,
    borderStyle: 'dashed', overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  pickedImage: { width: '100%', height: '100%' },
  imagePickerInner: { alignItems: 'center', gap: 6 },
  imagePickerIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  imagePickerTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', marginTop: 2 },
  imagePickerSub: { fontSize: FONT_SIZE.xs },

  formSection: { borderRadius: RADIUS.xl, borderWidth: 1, overflow: 'hidden' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
  fieldIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  fieldInput: { fontSize: FONT_SIZE.md, fontWeight: '500', padding: 0 },

  descSection: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.md },
  descLabel: { fontSize: 11, fontWeight: '600', marginBottom: SPACING.xs },
  descInput: { fontSize: FONT_SIZE.md, minHeight: 72, padding: 0 },

  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 15, borderRadius: RADIUS.full, marginTop: SPACING.xs },
  saveBtnText: { color: '#FFF', fontSize: FONT_SIZE.md, fontWeight: '700' },
});
