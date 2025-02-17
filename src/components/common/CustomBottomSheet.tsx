import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

interface CustomBottomSheetProps {
  sheetRef: React.RefObject<BottomSheet>;
  options: { label: string; onPress: () => void }[];
}

const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({ sheetRef, options }) => {
  // Calculate the height of the bottom sheet based on the number of options
  const optionHeight = 50;
  const snapPoints = useMemo(() => [options.length * optionHeight], [options.length]);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    // console.log('handleSheetChanges', index);
  }, []);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
    >
      <BottomSheetView style={styles.contentContainer}>
        {options.map((option, index) => (
          <TouchableOpacity key={index} style={styles.option} onPress={option.onPress}>
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
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

export default CustomBottomSheet;