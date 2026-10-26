import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SpotType } from '../types/spot';
import { spotsService } from '../services/api/spotsService';

interface AddSpotScreenProps {
  onSuccess: () => void;
}

export const AddSpotScreen: React.FC<AddSpotScreenProps> = ({ onSuccess }) => {
  const [street, setStreet] = useState('Dajwór 14');
  const [city, setCity] = useState('Kraków');
  const [postalCode, setPostalCode] = useState('31-052');
  const [price, setPrice] = useState('5.00');
  const [selectedType, setSelectedType] = useState<SpotType>('GARAGE');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await spotsService.createSpot({
        title: `Miejsce ${selectedType === 'GARAGE' ? 'Garażowe' : 'Parkingowe'} - ${street}`,
        address: street,
        city,
        postalCode,
        hourlyPrice: parseFloat(price) || 5.0,
        spotType: selectedType,
      });

      Alert.alert(
        'Miejsce opublikowane! 🚀',
        'Twoje miejsce parkingowe jest już widoczne dla kierowców w wyznaczonych godzinach.',
        [{ text: 'Wróć do mapy', onPress: onSuccess }]
      );
    } catch {
      Alert.alert('Błąd', 'Nie udało się dodać miejsca. Spróbuj ponownie.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dodaj swoje miejsce</Text>
          <TouchableOpacity>
            <Text style={styles.saveDraft}>Zapisz szkic</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Zarabiaj na wolnym miejscu parkingowym. Na początek wystarczy kilka informacji.
        </Text>

        {/* Location Section */}
        <Text style={styles.sectionHeading}>Gdzie jest Twoje miejsce?</Text>

        <Text style={styles.inputLabel}>Ulica i numer</Text>
        <TextInput
          style={styles.textInput}
          value={street}
          onChangeText={setStreet}
          placeholder="np. Dajwór 14"
        />

        <View style={styles.row}>
          <View style={[styles.flex1, { marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Miasto</Text>
            <TextInput
              style={styles.textInput}
              value={city}
              onChangeText={setCity}
              placeholder="Kraków"
            />
          </View>

          <View style={[styles.flex1, { marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Kod pocztowy</Text>
            <TextInput
              style={styles.textInput}
              value={postalCode}
              onChangeText={setPostalCode}
              placeholder="31-052"
            />
          </View>
        </View>

        <View style={styles.privacyNote}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyText}>Dokładny adres udostępnimy dopiero po rezerwacji.</Text>
        </View>

        {/* Price Section */}
        <View style={styles.priceHeaderRow}>
          <Text style={styles.sectionHeading}>Ustal cenę</Text>
          <Text style={styles.currencyBadge}>PLN</Text>
        </View>

        <Text style={styles.inputLabel}>Cena za godzinę</Text>
        <View style={styles.priceInputWrapper}>
          <TextInput
            style={styles.priceInput}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="5.00"
          />
          <Text style={styles.priceUnit}>/ godz.</Text>
        </View>

        <View style={styles.priceHintBox}>
          <Text style={styles.hintIcon}>💡</Text>
          <Text style={styles.hintText}>Miejsca w okolicy kosztują zwykle 4–8 zł za godz.</Text>
        </View>

        {/* Photos Section */}
        <View style={styles.photosHeaderRow}>
          <Text style={styles.sectionHeading}>Pokaż swoje miejsce</Text>
          <Text style={styles.photosCounter}>2 / 5 zdjęć</Text>
        </View>
        <Text style={styles.photosSub}>Dodaj wyraźne zdjęcia wjazdu i miejsca parkingowego.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosRow}>
          <View style={styles.photoThumbWrapper}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=400&q=80',
              }}
              style={styles.photoThumb}
            />
            <View style={styles.mainBadge}>
              <Text style={styles.mainBadgeText}>Główne</Text>
            </View>
          </View>

          <View style={styles.photoThumbWrapper}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80',
              }}
              style={styles.photoThumb}
            />
            <TouchableOpacity style={styles.removePhotoBadge}>
              <Text style={styles.removePhotoText}>✕</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addPhotoButton}>
            <Text style={styles.addPhotoIcon}>📷</Text>
            <Text style={styles.addPhotoLabel}>Dodaj zdjęcie</Text>
          </TouchableOpacity>
        </ScrollView>
        <Text style={styles.photoFormatNote}>JPG lub PNG · Do 10 MB na zdjęcie</Text>

        {/* Spot Type Section */}
        <Text style={styles.sectionHeading}>Rodzaj miejsca</Text>
        <View style={styles.typeOptionsRow}>
          <TouchableOpacity
            style={[styles.typeButton, selectedType === 'GARAGE' && styles.typeButtonSelected]}
            onPress={() => setSelectedType('GARAGE')}
          >
            <Text
              style={[styles.typeButtonText, selectedType === 'GARAGE' && styles.typeTextSelected]}
            >
              {selectedType === 'GARAGE' ? '✓ ' : ''}Garaż
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, selectedType === 'DRIVEWAY' && styles.typeButtonSelected]}
            onPress={() => setSelectedType('DRIVEWAY')}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedType === 'DRIVEWAY' && styles.typeTextSelected,
              ]}
            >
              {selectedType === 'DRIVEWAY' ? '✓ ' : ''}Podjazd
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, selectedType === 'OUTDOOR' && styles.typeButtonSelected]}
            onPress={() => setSelectedType('OUTDOOR')}
          >
            <Text
              style={[styles.typeButtonText, selectedType === 'OUTDOOR' && styles.typeTextSelected]}
            >
              {selectedType === 'OUTDOOR' ? '✓ ' : ''}Na zewnątrz
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.publishButton, isPublishing && styles.buttonDisabled]}
          onPress={handlePublish}
          disabled={isPublishing}
        >
          <Text style={styles.publishButtonText}>
            {isPublishing ? 'Publikowanie...' : 'Opublikuj miejsce ➔'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimerText}>
          Publikując, akceptujesz regulamin gospodarzy. Cenę i dostępność możesz zmienić w każdej
          chwili.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  saveDraft: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b5e3a',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  privacyIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  privacyText: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencyBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  priceUnit: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  hintIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '500',
  },
  photosHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photosCounter: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  photosSub: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  photosRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  photoThumbWrapper: {
    width: 100,
    height: 90,
    borderRadius: 12,
    marginRight: 12,
    position: 'relative',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  mainBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mainBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
  },
  removePhotoBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    width: 100,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  addPhotoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  photoFormatNote: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 16,
  },
  typeOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  typeButtonSelected: {
    borderColor: '#1b5e3a',
    backgroundColor: '#ecfdf5',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
  },
  typeTextSelected: {
    color: '#1b5e3a',
  },
  publishButton: {
    backgroundColor: '#1b5e3a',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  publishButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
});
