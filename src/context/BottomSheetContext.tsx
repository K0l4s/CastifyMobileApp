import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import OptionsBottomSheet from '../components/common/OptionsBottomSheet';
import GenrePickerBottomSheet from '../components/modals/GenrePickerBottomSheet';
import { Genre } from '../models/PodcastModel';

interface BottomSheetContextProps {
  showBottomSheet: (options: BottomSheetOption[]) => void;
  showGenrePicker: (genres: Genre[], selectedGenres: Genre[], toggleGenre: (genre: Genre) => void) => void;
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
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [toggleGenre, setToggleGenre] = useState<(genre: Genre) => void>(() => {});
  const [currentSheet, setCurrentSheet] = useState<'options' | 'genres'>('options');
  const sheetRef = useRef<BottomSheet>(null);

  const showBottomSheet = (options: BottomSheetOption[]) => {
    setOptions(options);
    setCurrentSheet('options');
    setIsVisible(true);
  };

  const showGenrePicker = (genres: Genre[], selectedGenres: Genre[], toggleGenre: (genre: Genre) => void) => {
    setGenres(genres);
    setSelectedGenres(selectedGenres);
    setToggleGenre(() => toggleGenre);
    setCurrentSheet('genres');
    setIsVisible(true);
  };

  const hideBottomSheet = () => {
    setIsVisible(false);
  };

  return (
    <BottomSheetContext.Provider value={{ showBottomSheet, showGenrePicker, hideBottomSheet }}>
      {children}
      {currentSheet === 'options' ? (
        <OptionsBottomSheet
          sheetRef={sheetRef}
          options={options}
          isVisible={isVisible}
          onClose={hideBottomSheet}
        />
      ) : (
        <GenrePickerBottomSheet
          sheetRef={sheetRef}
          genres={genres}
          selectedGenres={selectedGenres}
          toggleGenre={toggleGenre}
          isVisible={isVisible}
          onClose={hideBottomSheet}
        />
      )}
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