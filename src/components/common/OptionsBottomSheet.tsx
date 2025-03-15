import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

interface OptionsBottomSheetProps {
  sheetRef: React.RefObject<BottomSheet>;
  options: { label: string; onPress: () => void }[];
  isVisible: boolean;
  onClose: () => void;
}

const OptionsBottomSheet: React.FC<OptionsBottomSheetProps> = ({ sheetRef, options, isVisible, onClose }) => {
  // Calculate the height of the bottom sheet based on the number of options
  const optionHeight = 50;
  const snapPoints = useMemo(() => [Math.max(options.length * optionHeight, 100)], [options.length]);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    // console.log('handleSheetChanges', index);
  }, []);

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
        onChange={handleSheetChanges}
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
    zIndex: 0
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

export default OptionsBottomSheet;