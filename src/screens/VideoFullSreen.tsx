import React from 'react';
import { View, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

const VideoFullScreen = () => {
  return (
    <View style={styles.container}>
      {/* Ẩn status bar */}
      <StatusBar hidden={true} />

      <Video
        source={{ uri: 'https://path.to/your/video.mp4' }} // Thay link video mày vào đây
        style={styles.video}
        resizeMode="cover" // hoặc "contain" tùy ý mày
        controls
        fullscreen={true} // không cần thiết lắm nhưng cứ để
      />
    </View>
  );
};

export default VideoFullScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // nền đen cho ngầu
  },
  video: {
    width: width,
    height: height + (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0),
  },
});
