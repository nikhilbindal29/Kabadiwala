import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { recyclerService } from '../../src/services/recyclerService';

export default function RecyclerVerificationScreen() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Upload modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docType, setDocType] = useState('SPCB_AUTHORIZATION');
  const [docRef, setDocRef] = useState('');
  const [expiryDate, setExpiryDate] = useState('2028-12-31');
  const [submitting, setSubmitting] = useState(false);

  const loadDocuments = async () => {
    try {
      const res = await recyclerService.getDocuments();
      setDocuments(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async () => {
    if (!docRef.trim()) {
      Alert.alert('Required', 'Please enter your license / registration reference ID.');
      return;
    }
    setSubmitting(true);
    try {
      await recyclerService.uploadDocument({
        document_type: docType,
        file_path: `compliance/${docRef.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        document_reference: docRef.trim(),
        expiry_date: expiryDate,
      });
      Alert.alert('Document Submitted', 'Your authorization document has been queued for admin verification.');
      setIsModalOpen(false);
      setDocRef('');
      loadDocuments();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to submit document.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Checking facility compliance records..." />;

  return (
    <View style={styles.container}>
      <View style={styles.topBanner}>
        <View style={styles.bannerInfo}>
          <Text style={styles.bannerTitle}>Statutory Compliance Documents</Text>
          <Text style={styles.bannerSub}>
            Authorized recyclers must maintain active State Pollution Control Board authorizations.
          </Text>
        </View>
        <Button
          title="+ Add Document"
          size="small"
          onPress={() => setIsModalOpen(true)}
        />
      </View>

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDocuments(); }} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No Documents Uploaded"
            description="Submit your SPCB consent letter or e-waste authorization certificate."
            actionTitle="Upload Document"
            onAction={() => setIsModalOpen(true)}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.docType}>{item.document_type.replace('_', ' ')}</Text>
                <Text style={styles.refText}>Ref: {item.document_reference || 'N/A'}</Text>
              </View>
              <Badge label={item.verification_status} status={item.verification_status} />
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Valid Until:</Text>
              <Text style={styles.metaVal}>{item.expiry_date || 'Ongoing'}</Text>
            </View>

            {!!item.notes && (
              <Text style={styles.notesText}>Admin Feedback: {item.notes}</Text>
            )}
          </Card>
        )}
      />

      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Upload Compliance License</Text>
            <Text style={styles.modalSub}>
              Submit legal authorization for official platform verification.
            </Text>

            <Input
              label="Document Type *"
              placeholder="e.g. SPCB_AUTHORIZATION, CTE, CTO"
              value={docType}
              onChangeText={setDocType}
            />

            <Input
              label="License Reference / Certificate ID *"
              placeholder="e.g. SPCB/EW/2026/088"
              value={docRef}
              onChangeText={setDocRef}
            />

            <Input
              label="License Expiry Date (YYYY-MM-DD)"
              placeholder="2028-12-31"
              value={expiryDate}
              onChangeText={setExpiryDate}
            />

            <View style={styles.modalBtns}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setIsModalOpen(false)}
                style={styles.modalHalfBtn}
              />
              <Button
                title="Submit For Verification"
                onPress={handleUpload}
                loading={submitting}
                style={styles.modalHalfBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bannerInfo: {
    flex: 1,
    marginRight: 12,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  bannerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  docType: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  refText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  metaLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  notesText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    marginTop: 4,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  modalHalfBtn: {
    flex: 1,
  },
});

