import React, { useEffect, useState, useCallback } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { FullMemberInfor } from '../../models/Conversation';
import { userCard } from '../../models/User';
import UserService from '../../services/userService';
import { conversationService } from '../../services/conversationService';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface AddMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdded?: () => void;
    groupId: string;
    members: FullMemberInfor[];
    setMembers: React.Dispatch<React.SetStateAction<FullMemberInfor[]>>;
}

const AddMembersModal: React.FC<AddMembersModalProps> = ({
    isOpen,
    onClose,
    onAdded,
    members,
    setMembers,
    groupId
}) => {
    const route = useRoute<any>();
    const { conversationId } = route.params as { conversationId: string };

    const [followers, setFollowers] = useState<userCard[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<userCard[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [pageNumber, setPageNumber] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    const fetchFollowers = useCallback(async (reset = false) => {
        try {
            const response = await UserService.getFriends(
                reset ? 0 : pageNumber,
                pageSize,
                searchQuery.trim()
            );
            let newData: userCard[] = response.data.data;
            const existingIds = new Set((reset ? [] : followers).map(u => u.id));
            newData = newData.filter(u => !existingIds.has(u.id));

            if (reset) {
                setFollowers(newData);
                setPageNumber(1);
            } else {
                setFollowers(prev => [...prev, ...newData]);
                setPageNumber(prev => prev + 1);
            }
            setHasMore(newData.length === pageSize);
        } catch (err) {
            console.error('Failed to fetch followers:', err);
        }
    }, [pageNumber, searchQuery, followers]);

    useEffect(() => {
        if (isOpen) {
            fetchFollowers(true);
            setSelectedUsers([]);
            setSearchQuery('');
        }
    }, [isOpen]);

    const handleSelectUser = (user: userCard) => {
        if (!selectedUsers.some(u => u.id === user.id)) {
            setSelectedUsers(prev => [...prev, user]);
            setFollowers(prev => prev.filter(f => f.id !== user.id));
        }
    };

    const handleDeselectUser = (user: userCard) => {
        if (!followers.some(f => f.id === user.id)) {
            setFollowers(prev => [...prev, user]);
            setSelectedUsers(prev => prev.filter(s => s.id !== user.id));
        }
    };

    const handleAddMembers = async () => {
        try {
            const request = await conversationService.addMembers(
                selectedUsers.map(u => u.id),
                conversationId
            );
            const newMembers: FullMemberInfor[] = request.data;
            setMembers(prev => [...prev, ...newMembers]);
            onClose();
            onAdded?.();
        } catch (error) {
            console.error('Failed to add members:', error);
        }
    };

    const isAlreadyMember = (userId: string) => {
        return members.some(member => member.members.id === userId);
    };

    return (
        <Modal visible={isOpen} animationType="slide" onRequestClose={onClose} transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    justifyContent: 'center',
                    padding: 20,
                }}
            >
                <TouchableOpacity onPress={onClose} style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    backgroundColor: 'white',
                    borderRadius: 20,
                    padding: 6,
                    elevation: 4,
                }}>
                    <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>

                <View style={{
                    backgroundColor: 'white',
                    borderRadius: 20,
                    padding: 20,
                    maxHeight: '90%',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 10
                }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                        Add Members to Group
                    </Text>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderColor: '#ddd',
                        borderWidth: 1,
                        borderRadius: 12,
                        paddingHorizontal: 10,
                        backgroundColor: '#f9f9f9',
                        marginBottom: 16,
                    }}>
                        <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
                        <TextInput
                            placeholder="Search friends..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={() => {
                                setPageNumber(0);
                                fetchFollowers(true);
                            }}
                            style={{
                                flex: 1,
                                paddingVertical: 8,
                                fontSize: 16
                            }}
                        />
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                        {selectedUsers.map(user => (
                            <TouchableOpacity
                                key={user.id}
                                onPress={() => handleDeselectUser(user)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: '#e3f2fd',
                                    borderColor: '#90caf9',
                                    borderWidth: 1,
                                    marginRight: 8,
                                    paddingHorizontal: 10,
                                    paddingVertical: 4,
                                    borderRadius: 20,
                                    shadowColor: '#90caf9',
                                    shadowOffset: { width: 1, height: 1 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 4,
                                }}
                            >
                                <Image
                                    source={{ uri: user.avatarUrl }}
                                    style={{ width: 24, height: 24, borderRadius: 12, marginRight: 4 }}
                                />
                                <Text style={{ fontSize: 14 }}>{user.fullname}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <FlatList
                        data={followers}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        onEndReached={() => {
                            if (hasMore) fetchFollowers();
                        }}
                        onEndReachedThreshold={0.5}
                        style={{ maxHeight: 250 }}
                        renderItem={({ item }) => {
                            const alreadyInGroup = isAlreadyMember(item.id);
                            return (
                                <TouchableOpacity
                                    disabled={alreadyInGroup}
                                    onPress={() => {
                                        if (!alreadyInGroup) handleSelectUser(item);
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingVertical: 10,
                                        paddingHorizontal: 6,
                                        borderBottomColor: '#eee',
                                        borderBottomWidth: 1,
                                        backgroundColor: '#fff',
                                        borderRadius: 8,
                                        marginBottom: 4,
                                        opacity: alreadyInGroup ? 0.5 : 1,
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={{ uri: item.avatarUrl }}
                                            style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
                                        />
                                        <View>
                                            <Text style={{ fontSize: 14, fontWeight: '500' }}>{item.fullname}</Text>
                                            <Text style={{ fontSize: 12, color: 'gray' }}>@{item.username}</Text>
                                        </View>
                                    </View>
                                    {alreadyInGroup && <Ionicons name="people-outline" size={18} color="#aaa" />}
                                </TouchableOpacity>
                            );
                        }}
                        ListEmptyComponent={
                            <Text style={{ textAlign: 'center', color: 'gray', padding: 12 }}>
                                No available users.
                            </Text>
                        }
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                        <TouchableOpacity
                            onPress={handleAddMembers}
                            disabled={selectedUsers.length === 0}
                            style={{
                                backgroundColor: selectedUsers.length > 0 ? '#4caf50' : '#ccc',
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                borderRadius: 30,
                                shadowColor: '#4caf50',
                                shadowOffset: { width: 0, height: 3 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 4,
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Add Members</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default AddMembersModal;
