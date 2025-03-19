import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import OptionsBottomSheet from '../components/common/OptionsBottomSheet';
import GenrePickerBottomSheet from '../components/modals/GenrePickerBottomSheet';
import { Genre } from '../models/PodcastModel';
import CommentSection from '../components/podcast/CommentSection';
import { BackHandler, StyleSheet, TouchableOpacity, View } from 'react-native';

interface BottomSheetContextProps {
  showBottomSheet: (options: BottomSheetOption[]) => void;
  showGenrePicker: (genres: Genre[], selectedGenres: Genre[], toggleGenre: (genre: Genre) => void) => void;
  showCommentSection: (podcastId: string) => void;
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
  const [currentSheet, setCurrentSheet] = useState<'options' | 'genres' | 'comments'>('options');
  const [podcastId, setPodcastId] = useState<string | null>(null);
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

  const showCommentSection = (podcastId: string) => {
    setPodcastId(podcastId);
    setCurrentSheet('comments');
    setIsVisible(true);
  };

  const hideBottomSheet = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    const handleBackPress = () => {
      if (isVisible) {
        hideBottomSheet(); // Đóng BottomSheet nếu đang mở
        return true; // Chặn hành động Back mặc định
      }
      return false; // Cho phép hành động Back mặc định nếu BottomSheet không mở
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [isVisible]);

  return (
    <BottomSheetContext.Provider value={{ showBottomSheet, showGenrePicker, showCommentSection, hideBottomSheet }}>
      {children}
      {/* Overlay */}
      {isVisible && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={hideBottomSheet}>
          <View />
        </TouchableOpacity>
      )}

      {currentSheet === 'options' && (
        <OptionsBottomSheet
          sheetRef={sheetRef}
          options={options}
          isVisible={isVisible}
          onClose={hideBottomSheet}
        />
      )}
      {currentSheet === 'genres' && (
        <GenrePickerBottomSheet
          sheetRef={sheetRef}
          genres={genres}
          selectedGenres={selectedGenres}
          toggleGenre={toggleGenre}
          isVisible={isVisible}
          onClose={hideBottomSheet}
        />
      )}
      {currentSheet === 'comments' && podcastId && (
        <CommentSection 
          sheetRef={sheetRef}
          podcastId={podcastId}
          isVisible={isVisible}
          onClose={hideBottomSheet} />
      )}
    </BottomSheetContext.Provider>
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
});

export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
};