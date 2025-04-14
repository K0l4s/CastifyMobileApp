import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, ActivityIndicator, Text, FlatList, Image, ToastAndroid, Alert } from 'react-native';
import GenreService from '../services/genreService';
import PodcastService from '../services/podcastService';
import { Genre } from '../models/PodcastModel';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useBottomSheet } from '../context/BottomSheetContext';
import { TextInput } from 'react-native-paper';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import Toast from 'react-native-toast-message';

const CreateScreen = () => {
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<Asset | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const navigation = useNavigation();
  const { showGenrePicker, hideBottomSheet } = useBottomSheet();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await GenreService.getGenres();
        setGenres(genresData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  const toggleGenre = (genre: Genre) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre);
      } else if (prev.length < 5) {
        return [...prev, genre];
      }
      return prev;
    });
  };

  const openGenrePicker = () => {
    showGenrePicker(genres, selectedGenres, toggleGenre);
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        setThumbnailPreview(selectedImage.uri || '');
        setThumbnail(selectedImage);
        // setThumbnail({
        //   uri: selectedImage.uri,
        //   type: selectedImage.type,
        //   name: selectedImage.fileName,
        // } as unknown as File);
      }
    });
  };
  
  const pickVideo = () => {
    launchImageLibrary({ mediaType: 'video' }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled video picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else if (response.assets && response.assets.length > 0) {
        const selectedVideo = response.assets[0];
        setVideoPreview(selectedVideo.uri || '');
        setVideo({
          uri: selectedVideo.uri,
          type: selectedVideo.type,
          name: selectedVideo.fileName,
        } as unknown as File);
      }
    });
  };

  const handleSubmit = async () => {
    if (!title || !content || !video || selectedGenres.length < 1) {
      Alert.alert('Warning', 'Please fill all required fields and select at least 1 genres.');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("video", video);
    
    if (thumbnail) {
      formData.append("thumbnail", {
        uri: thumbnail.uri,
        type: thumbnail.type,
        name: thumbnail.fileName,
      });
    }

    // Append genres
    selectedGenres.forEach((genre) => formData.append("genreIds", genre.id));

    try {
      await PodcastService.uploadPodcast(formData);
      Toast.show({
        type: 'success',
        text1: 'Upload successful',
        text2: 'Your podcast has been uploaded successfully'
      });
      navigation.goBack();
    } catch (error) {
      console.error("Error uploading podcast:", error);
      Alert.alert("Error", "Failed to upload podcast. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Upload your podcast</Text>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => navigation.goBack()}
          disabled={uploading}
        >
          <Icon name="close" size={30} color={uploading ? "#ccc" : "#000"} />
        </TouchableOpacity>
      </View>
      <View style={styles.mainContainer}>
        <FlatList
          data={[{ key: 'form' }]}
          renderItem={() => (
            <View style={styles.contentContainer}>
              <TextInput
                style={styles.input}
                label={'Title*'}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
              <Text style={styles.charCount}>{title.length}/100</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                label={'Content* (Description)'}
                value={content}
                onChangeText={setContent}
                multiline
                maxLength={5000}
              />
              <Text style={styles.charCount}>{content.length}/5000</Text>
              <View style={styles.buttonContainer}>
                <Button 
                  title="Select Video" 
                  onPress={pickVideo} 
                />
              </View>
              {videoPreview && (
                <View style={styles.videoContainer}>
                  <Text style={styles.fileText}>Video selected</Text>
                  <Video
                    source={{ uri: videoPreview }}
                    style={styles.video}
                    controls={true}
                    resizeMode="cover"
                  />
                </View>
              )}
              <View style={styles.buttonContainer}>
                <Button 
                  title="Select Thumbnail" 
                  onPress={pickImage} 
                />
              </View>
              {thumbnailPreview && <Image source={{ uri: thumbnailPreview }} style={styles.thumbnail} />}
              <View style={styles.buttonContainer}>
                <Button 
                  title="Select Genres" 
                  onPress={openGenrePicker} 
                />
              </View>
              <FlatList
                data={selectedGenres}
                renderItem={({ item }) => (
                  <View style={styles.genreItem}>
                    <Text style={styles.genreText}>{item.name}</Text>
                  </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                contentContainerStyle={styles.selectedGenresContainer}
              />
              <View style={styles.buttonContainer}>
                <Button 
                  title="Upload" 
                  onPress={handleSubmit} 
                  color={'#1f3ad1'} 
                />
              </View>
            </View>
          )}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.scrollContainer}
        />
        
        {uploading && (
          <View style={styles.overlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.uploadingText}>Uploading podcast...</Text>
            </View>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b39cf'
  },
  closeButton: {
    padding: 5,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 0,
  },
  contentContainer: {
    flex: 1,
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  textArea: {
    height: 100,
  },
  charCount: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    color: '#888',
  },
  buttonContainer: {
    marginVertical: 10,
  },
  fileText: {
    marginVertical: 10,
    color: 'green',
  },
  thumbnail: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  videoContainer: {
    marginVertical: 10,
  },
  video: {
    width: '100%',
    height: 200,
  },
  selectedGenresContainer: {
    marginTop: 10,
  },
  genreItem: {
    backgroundColor: '#2169de',
    padding: 10,
    margin: 5,
    borderRadius: 20,
  },
  genreText: {
    color: 'white',
  },
  uploadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default CreateScreen;