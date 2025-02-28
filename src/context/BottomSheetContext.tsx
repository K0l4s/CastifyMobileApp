import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import CustomBottomSheet from '../components/common/CustomBottomSheet';
import BottomSheet from '@gorhom/bottom-sheet';

interface BottomSheetContextProps {
  showBottomSheet: (options: BottomSheetOption[]) => void;
  hideBottomSheet: () => void;
}

interface BottomSheetOption {
  label: string;
  onPress: () => void;
}

const BottomSheetContext = createContext<BottomSheetContextProps | undefined>(undefined);

export const BottomSheetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [options, setOptions] = useState<BottomSheetOption[]>([]);
  const sheetRef = useRef<BottomSheet>(null);

  const showBottomSheet = (options: BottomSheetOption[]) => {
    setOptions(options);
    setIsVisible(true);
  };

  const hideBottomSheet = () => {
    setIsVisible(false);
  };

  return (
    <BottomSheetContext.Provider value={{ showBottomSheet, hideBottomSheet }}>
      {children}
      <CustomBottomSheet
        sheetRef={sheetRef}
        options={options}
        isVisible={isVisible}
        onClose={hideBottomSheet}
      />
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
};