import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

interface BadgeProps {
  label: string;
  status?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, status }) => {
  const getColors = () => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'ACCEPTED':
      case 'COMPLETED':
      case 'VERIFIED':
        return { bg: '#D4EDDA', text: '#155724' };
      case 'PENDING':
      case 'SCHEDULED':
      case 'IN_PROGRESS':
        return { bg: '#FFF3CD', text: '#856404' };
      case 'RESERVED':
        return { bg: '#CCE5FF', text: '#004085' };
      case 'REJECTED':
      case 'CANCELLED':
      case 'SUSPENDED':
        return { bg: '#F8D7DA', text: '#721C24' };
      default:
        return { bg: '#E2E3E5', text: '#383D41' };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

