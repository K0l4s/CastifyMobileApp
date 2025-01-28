import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, Modal, TouchableOpacity, Text, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ visible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  let inputRef: TextInput | null = null;

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        if (inputRef) {
          inputRef.focus();
        }
      }, 500);
    } else {
      setSearchQuery(''); // Clear input
    }
  }, [visible]);

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
        <View style={styles.searchBar}>
          {/* Nút quay lại */}
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Icon name="arrow-back" size={22} color="black" />
          </TouchableOpacity>

          {/* Ô tìm kiếm */}
          <TextInput
            ref={(ref) => { inputRef = ref; }}
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Nội dung tìm kiếm */}
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Search result will be displayed here</Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 4,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    marginLeft: 10,
  },
  resultContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    fontSize: 16,
    color: 'gray',
  },
});

export default SearchModal;
