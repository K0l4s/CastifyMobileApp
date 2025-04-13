import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NotiModel } from '../models/Notification';
import { NotificationService } from '../services/NotificationService';
import { RootState } from '../redux/store';
import useStomp from '../hooks/useStomp';
import PodcastService from '../services/podcastService';

const NotificationScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const [notifications, setNotifications] = useState<NotiModel[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<FlatList>(null);

  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const formatTimeCalculation = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return `${seconds} giây trước`;
  };

  const fetchNotifications = async (currentPage: number) => {
    if (currentPage !== 0) setLoading(true);
    try {
      const res = await NotificationService.getAllNotification(currentPage, 5);
      const newNotis = res.data.data;
      setNotifications(prev =>
        currentPage === 0 ? newNotis : [...prev, ...newNotis]
      );
      setHasMore(newNotis.length === 5);
    } catch (err) {
      // console.error('Lỗi tải thông báo:', err);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    await fetchNotifications(0);
    setRefreshing(false);
  };

  useEffect(() => {
    setNotifications([]);
    setPage(0);
    setHasMore(true);
    fetchNotifications(0);
  }, [userId]);

  useEffect(() => {
    if (page !== 0) {
      fetchNotifications(page);
    }
  }, [page]);

  const handleLoadMore = () => {
    if (!loading && hasMore && !refreshing) {
      setPage(prev => prev + 1);
    }
  };
  const user = useSelector((state: RootState) => state.auth.user);
  const [message, setNewMessage] = useState<NotiModel>();
  const stomp = useStomp({
    subscribeUrl: `/user/${user?.id}/queue/notification`,
    trigger: [],
  });

  useEffect(() => {
    if (stomp) {
      console.log(stomp);
      setNewMessage(stomp);
      // dispatch(setTotalUnRead(totalUnRead + 1));
    }
  }, [stomp]);
  useEffect(() => {
    if (message) {
      setNotifications(prev => {
        const exists = prev.some(n => n.id === message!.id);
        if (exists) return prev;
        return [message!, ...prev];
      });
    }
  }, [message]);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thông báo</Text>
      </View>

      <FlatList
        ref={scrollRef}
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListFooterComponent={
          loading && !refreshing ? <ActivityIndicator size="small" color="#888" /> : null
        }
        ListEmptyComponent={
          !loading && !refreshing ? (
            <Text style={styles.emptyText}>Không có thông báo nào</Text>
          ) : null
        }
        renderItem={({ item: noti }) => (
          <TouchableOpacity
            style={[
              styles.notificationItem,
              !noti.read && { backgroundColor: '#f0f0f0' },
            ]}
            onPress={() => {
              noti.read = true;
              console.log(noti)
              const notiUrl = noti.targetUrl.split('/');
              console.log('notiUrl', notiUrl);
              if(notiUrl[1]==="profile")
              {
                navigation.navigate('Profile', { username: notiUrl[2] });
              }
              else if(notiUrl[1].includes("watch"))
              {
                const id = notiUrl[1].split('=')[1];
                console.log("id", id);
                const response = PodcastService.getPodcastById(id);
                response.then((res) => {
                  const podcast = res;
                  console.log("podcast", podcast);
                  navigation.navigate('Podcast', { podcast });
                });
              }
              // if (notiUrl.includes('/profile/')) {
              //   navigation.navigate('Profile', { username:id });
              // }
              // navigation.navigate(noti.targetUrl); // cần đảm bảo targetUrl là tên route
            }}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <Text style={styles.titleText}>{noti.title}</Text>
                {!noti.read && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newText}>NEW</Text>
                  </View>
                )}
              </View>
              <Text style={styles.content}>{noti.content}</Text>
              <Text style={styles.time}>{formatTimeCalculation(noti.createdAt)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  newBadge: {
    backgroundColor: '#e11d48',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    marginLeft: 6,
  },
  newText: {
    fontSize: 10,
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    padding: 20,
  },
});
