import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';

interface ContentBottomSheetProps {
  content: string;
  sheetRef: React.RefObject<BottomSheet>;
  onClose: () => void;
}

const ContentBottomSheet: React.FC<ContentBottomSheetProps> = ({ content, sheetRef, onClose }) => {
  const snapPoints = ['50%', '90%']; // Snap points cho BottomSheet

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={onClose}
    >
      <BottomSheetView style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.header}>Description</Text>
        <ScrollView>
          <Text style={styles.contentText}>{content}</Text>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  contentText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});

export default ContentBottomSheet;