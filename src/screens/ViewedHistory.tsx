import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import UserActivityService from '../services/userActivityService';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import PodcastItem from '../components/podcast/PodcastItem';
import ConfirmDialog from '../components/modals/ConfirmDialogModal';
import BottomSheet from '@gorhom/bottom-sheet';
import { Podcast } from '../models/PodcastModel';

interface Activity {
  id: string;
  podcast: Podcast;
  timestamp: string;
}

const ViewedHistory: React.FC = () => {
  const [activities, setActivities] = useState<{ date: string; items: Activity[] }[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const navigation = useNavigation();
  const confirmDialogRef = useRef<BottomSheet>(null);

  const groupByDate = (data: Activity[]) => {
    const grouped: { [key: string]: Activity[] } = {};

    data.forEach((activity) => {
      const date = new Date(activity.timestamp).toLocaleDateString(); // Format the date
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });

    return Object.entries(grouped).map(([date, items]) => ({ date, items }));
  };

  const fetchActivities = async (pageNumber: number) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await UserActivityService.getUserActivities(pageNumber);
      const parsedActivities = response.content.map((item: any) => ({
        id: item.id,
        podcast: item.podcast,
        timestamp: item.timestamp,
      }));

      const groupedActivities = groupByDate(parsedActivities);

      setActivities((prev) => (pageNumber === 0 ? groupedActivities : [...prev, ...groupedActivities]));
      setHasMore(pageNumber + 1 < response.totalPages);
      setPage(pageNumber + 1);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchActivities = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await UserActivityService.searchUserActivities(searchQuery);

      // Map the response to match the expected format
      const groupedActivities = response.map((group: any) => ({
        date: group.date,
        items: group.activities.map((activity: any) => ({
          id: activity.id,
          podcast: activity.podcast,
          timestamp: activity.timestamp,
        })),
      }));

      setActivities(groupedActivities);
      setHasMore(false); // Disable lazy loading for search results
    } catch (error) {
      console.error('Error searching user activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setActivities([]); // Clear activities to force re-render
    setPage(0);
    setHasMore(true);
    fetchActivities(0); // Reload original activities
  };

  const deleteAllActivities = async () => {
    try {
      await UserActivityService.removeAllUserActivities();
      setActivities([]);
      setPage(0);
      setHasMore(false);
    } catch (error) {
      console.error('Error deleting all activities:', error);
    } finally {
      setIsConfirmVisible(false); // Close the dialog
    }
  };

  const removeActivity = async (id: string) => {
    try {
      await UserActivityService.removeUserActivity(id);
      setActivities((prev) =>
        prev
          .map((group) => ({
            ...group,
            items: group.items.filter((item) => item.id !== id),
          }))
          .filter((group) => group.items.length > 0) // Remove empty groups
      );
    } catch (error) {
      console.error('Error removing activity:', error);
    }
  };

  useEffect(() => {
    fetchActivities(0);
  }, []);

  const renderActivityItem = useCallback(
    ({ item }: { item: Activity }) => {
      const menuOptions = [
        { label: 'Remove from history', onPress: () => removeActivity(item.id) },
      ];

      return <PodcastItem podcast={item.podcast} menuOptions={menuOptions} />;
    },
    [removeActivity]
  );

  const renderDateGroup = ({ item }: { item: { date: string; items: Activity[] } }) => (
    <View style={styles.dateGroup}>
      <Text style={styles.dateHeader}>{item.date}</Text>
      <FlatList
        data={item.items}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        getItemLayout={(data, index) => ({
          length: 100, // Approximate height of each item
          offset: 100 * index,
          index,
        })}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.header}>Viewed History</Text>
        <TouchableOpacity style={styles.trashButton} onPress={() => setIsConfirmVisible(true)}>
          <Icon name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionsContainer}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search podcasts..."
            placeholderTextColor={"#ccc"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchActivities}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={resetSearch}>
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {activities.length === 0 && (
        <View>
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#ccc' }}>No activities found.</Text>
          {loading && <ActivityIndicator size="small" color="#000" />}
        </View>
      )}
      
      <FlatList
        data={activities}
        renderItem={renderDateGroup}
        keyExtractor={(item) => item.date}
        onEndReached={() => fetchActivities(page)} // Trigger fetch when scrolling
        onEndReachedThreshold={0.8} // Fetch when 80% from the bottom
        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#000" /> : null}
      />
      <ConfirmDialog
        sheetRef={confirmDialogRef}
        isVisible={isConfirmVisible}
        title="Confirm Delete"
        message="Are you sure you want to delete all viewed history?"
        onCancel={() => setIsConfirmVisible(false)}
        onConfirm={deleteAllActivities}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  trashButton: {
    padding: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingRight: 30,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default ViewedHistory;