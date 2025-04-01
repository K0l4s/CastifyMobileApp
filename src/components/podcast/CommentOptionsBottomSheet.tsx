import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

interface CommentOptionsBottomSheetProps {
  sheetRef: React.RefObject<BottomSheet>;
  isVisible: boolean;
  isOwner: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}

const CommentOptionsBottomSheet: React.FC<CommentOptionsBottomSheetProps> = ({
  sheetRef,
  isVisible,
  isOwner,
  onClose,
  onEdit,
  onDelete,
  onReport,
}) => {
  const options = useMemo(() => {
    if (isOwner) {
      return [
        { label: 'Edit', onPress: onEdit },
        { label: 'Delete', onPress: onDelete },
      ];
    }
    return [{ label: 'Report', onPress: onReport }];
  }, [isOwner, onEdit, onDelete, onReport]);

  const snapPoints = useMemo(() => [options.length * 50 + 20], [options.length]);

  useEffect(() => {
    if (isVisible) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [isVisible]);

  return (
    <>
      {isVisible && (
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
      <BottomSheet
        ref={sheetRef}
        index={isVisible ? 0 : -1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={onClose}
      >
        <BottomSheetView style={styles.contentContainer}>
          {options.map((option, index) => (
            <TouchableOpacity key={index} style={styles.option} onPress={option.onPress}>
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </BottomSheetView>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 0,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  option: {
    height: 50,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    fontSize: 16,
  },
});

export default CommentOptionsBottomSheet;