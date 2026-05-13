import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

export default function StarRating({ rating = 0, maxRating = 5, size = 16, onRate, readonly = true }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <TouchableOpacity
            key={i}
            onPress={() => !readonly && onRate?.(i + 1)}
            disabled={readonly}
            activeOpacity={0.7}
          >
            <Ionicons
              name={filled ? 'star' : half ? 'star-half' : 'star-outline'}
              size={size}
              color={filled || half ? '#F59E0B' : '#D1D5DB'}
              style={{ marginRight: 1 }}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
