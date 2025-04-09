import { VideoRef } from "react-native-video";

export const setupVideoViewTracking = (
  videoRef: React.RefObject<VideoRef>,
  incrementPodcastViews: (id: string) => Promise<any>,
  id: string,
  onViewIncremented: () => void,
  duration: number // Thời lượng video
) => {
  let watchTime = 0; // Tổng thời gian đã xem
  let lastUpdateTime = 0; // Thời gian cập nhật gần nhất
  let continuousThreshold = Math.min(10, duration); // Ngưỡng thời gian xem để tăng view (10s hoặc thời lượng video)
  let viewIncremented = false;

  const handleProgress = (data: { currentTime: number }) => {
    const currentTime = data.currentTime;

    // Tính khoảng thời gian xem từ lần cập nhật trước
    if (currentTime - lastUpdateTime < 1.5) {
      watchTime += currentTime - lastUpdateTime; // Cộng dồn thời gian xem
    }

    lastUpdateTime = currentTime; // Cập nhật thời gian gần nhất

    // Kiểm tra nếu đủ điều kiện tăng view
    if (watchTime >= continuousThreshold && !viewIncremented) {
      incrementPodcastViews(id)
        .then((response) => {
          console.log('Views incremented: ', response);
          onViewIncremented();
        })
        .catch((error) => {
          console.error('Failed to increment views: ', error);
        });

      viewIncremented = true;
    }
  };

  const handleEnd = () => {
    // Nếu video kết thúc và chưa tăng view, tăng view ngay lập tức
    if (!viewIncremented) {
      incrementPodcastViews(id)
        .then((response) => {
          console.log('Views incremented on end: ', response);
          onViewIncremented();
        })
        .catch((error) => {
          console.error('Failed to increment views on end: ', error);
        });

      viewIncremented = true;
    }

    // Reset trạng thái khi video kết thúc
    watchTime = 0;
    lastUpdateTime = 0;
    viewIncremented = false;
  };

  return {
    handleProgress,
    handleEnd,
  };
};