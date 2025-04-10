import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    FlatList,
    Alert,
    StyleSheet
} from 'react-native';
import { ConversationDetail, FullMemberInfor } from '../models/Conversation';
import { conversationService } from '../services/conversationService';
import { RootParamList } from '../type/navigationType';
import { StackNavigationProp } from '@react-navigation/stack';

const ChatSettingScreen = () => {
    const route = useRoute();
    const navigation = useNavigation<StackNavigationProp<RootParamList>>();

    const { conversationId } = route.params as { conversationId: string };
    const [chatDetail, setChatDetail] = useState<ConversationDetail>({
        id: '',
        title: '',
        imageUrl: '',
        memberSize: 0,
        memberList: [],
        createdAt: '',
        active: true
    });
    const [members, setMembers] = useState<FullMemberInfor[]>([]);
    useEffect(() => {
        const fetchChatDetail = async () => {
            try {
                const response = await conversationService.getDetailChat(conversationId);
                setChatDetail(response.data);
                setGroupName(response.data.title);
                setAvatar(response.data.imageUrl);
            } catch (error) {
                console.error('Failed to fetch chat detail:', error);
            }
        };
        fetchChatDetail();
    }
        , [conversationId]);
    useEffect(() => {
        const fetchMembers = async () => {
            if (chatDetail) {
                try {
                    const response = await conversationService.getMembers(conversationId);
                    setMembers(response.data);
                } catch (error) {
                    console.error('Failed to fetch members:', error);
                }
            }
        }
        fetchMembers();
    }
        , [chatDetail]);
        // const { chatDetail, memberList: initialMembers }: {
        //     chatDetail: ConversationDetail;
        //     memberList: FullMemberInfor[];
        // } = route.params as any;

        const [groupName, setGroupName] = useState(chatDetail.title);
        const [isEdit, setIsEdit] = useState(false);
        const [isNameChanged, setIsNameChanged] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [avatar, setAvatar] = useState(chatDetail.imageUrl);
        const [selectedFile, setSelectedFile] = useState<any>(null);
        const [isOpenAdd, setIsOpenAdd] = useState(false);

        useEffect(() => {
            navigation.setOptions({
                title: 'Chat Settings',
                headerTitleAlign: 'center',
            });
        }, []);

        // const pickImage = async () => {
        //     const result = await ImagePicker.launchImageLibraryAsync({
        //         allowsEditing: true,
        //         quality: 1,
        //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
        //     });

        //     if (!result.canceled) {
        //         setSelectedFile(result.assets[0]);
        //         setAvatar(result.assets[0].uri);
        //     }
        // };

        const handleConfirmImage = async () => {
            if (!selectedFile) return;
            try {
                setIsLoading(true);
                await conversationService.changeImage(
                    {
                        uri: selectedFile.uri,
                        name: 'avatar.jpg',
                        type: 'image/jpeg'
                    } as any,
                    chatDetail.id
                );
                setSelectedFile(null);
            } catch (err) {
                console.error('Failed to update image', err);
            } finally {
                setIsLoading(false);
            }
        };

        const handleChangeName = async () => {
            if (!groupName.trim() || groupName === chatDetail.title) return;
            try {
                setIsLoading(true);
                await conversationService.changeTitle(groupName.trim(), chatDetail.id);
                setIsEdit(false);
                setIsNameChanged(false);
            } catch (err) {
                console.error('Failed to change name', err);
            } finally {
                setIsLoading(false);
            }
        };

        const handleDeleteMember = async (memberId: string) => {
            Alert.alert('Confirm', 'Remove this member?', [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            console.log('Deleting member:', memberId, conversationId);
                            await conversationService.deleteMembers(memberId, conversationId);
                            setMembers(prev => prev.filter(m => m.members.id !== memberId));
                        } catch (err) {
                            console.error(err);
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]);
        };

        return (
            <View style={styles.container}>
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                    </View>
                )}

                <TouchableOpacity style={styles.avatarWrap} 
                // onPress={pickImage}
                >
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                    <View style={styles.avatarOverlay}>
                        <Text style={styles.avatarPlus}>+</Text>
                    </View>
                </TouchableOpacity>

                {selectedFile && (
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmImage}>
                            <Text style={styles.confirmText}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => {
                            setSelectedFile(null);
                            setAvatar(chatDetail.imageUrl);
                        }}>
                            <Text style={styles.confirmText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.section}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Group Name</Text>
                        <TouchableOpacity onPress={() => {
                            if (isEdit) {
                                setIsEdit(false);
                                setGroupName(chatDetail.title);
                                setIsNameChanged(false);
                            } else {
                                setIsEdit(true);
                            }
                        }}>
                            <Text style={styles.changeBtn}>{isEdit ? 'Cancel' : 'Change'}</Text>
                        </TouchableOpacity>
                    </View>
                    {isEdit ? (
                        <>
                            <TextInput
                                style={styles.input}
                                value={groupName}
                                onChangeText={(text) => {
                                    setGroupName(text);
                                    setIsNameChanged(true);
                                }}
                            />
                            {isNameChanged && (
                                <TouchableOpacity onPress={handleChangeName}>
                                    <Text style={styles.saveBtn}>Save Name</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    ) : (
                        <Text style={styles.groupName}>{chatDetail.title}</Text>
                    )}
                </View>

                <View style={styles.section}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Members ({chatDetail.memberSize})</Text>
                        <TouchableOpacity onPress={() => setIsOpenAdd(true)}>
                            <Text style={styles.changeBtn}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={members}
                        keyExtractor={(item) => item.members.id}
                        renderItem={({ item }) => (
                            <View style={styles.memberRow}>
                                <Image
                                    source={{ uri: item.members.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                                    style={styles.memberAvatar}
                                />
                                <View style={styles.memberInfo}>
                                    <View style={styles.memberNameRow}>
                                        <Text style={[
                                            styles.memberName,
                                            item.role === 'LEADER' ? styles.leader :
                                                item.role === 'DEPUTY' ? styles.deputy : null
                                        ]}>
                                            {item.members.fullname}
                                        </Text>
                                        {item.role === 'LEADER' && (
                                            // <AntDesign name="key" size={14} color="gold" />
                                            <Text style={styles.leader}>Leader</Text>
                                        )}
                                    </View>
                                    <Text style={styles.username}>@{item.members.username}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDeleteMember(item.members.id)}>
                                    {/* <MaterialIcons name="remove-circle" size={24} color="red" /> */}
                                    <Text style={styles.changeBtn}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>

                {/* <AddMembersModal
                    isVisible={isOpenAdd}
                    onClose={() => setIsOpenAdd(false)}
                    members={members}
                    setMembers={setMembers}
                    conversationId={chatDetail.id}
                /> */}
            </View>
        );
    };

    export default ChatSettingScreen;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 16,
            backgroundColor: '#fff'
        },
        loadingOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10
        },
        avatarWrap: {
            width: 120,
            height: 120,
            borderRadius: 60,
            alignSelf: 'center',
            marginBottom: 12
        },
        avatar: {
            width: '100%',
            height: '100%',
            borderRadius: 60
        },
        avatarOverlay: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: 60,
            justifyContent: 'center',
            alignItems: 'center'
        },
        avatarPlus: {
            color: '#fff',
            fontSize: 28,
            fontWeight: 'bold'
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 10
        },
        confirmBtn: {
            backgroundColor: '#3b82f6',
            padding: 10,
            borderRadius: 8
        },
        cancelBtn: {
            backgroundColor: '#6b7280',
            padding: 10,
            borderRadius: 8
        },
        confirmText: {
            color: '#fff'
        },
        section: {
            marginTop: 16
        },
        label: {
            fontWeight: 'bold',
            marginBottom: 4
        },
        input: {
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 6,
            padding: 8,
            marginTop: 6
        },
        saveBtn: {
            color: '#3b82f6',
            marginTop: 8
        },
        groupName: {
            color: '#374151',
            fontSize: 16
        },
        changeBtn: {
            color: '#3b82f6'
        },
        rowBetween: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        memberRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            gap: 10
        },
        memberAvatar: {
            width: 40,
            height: 40,
            borderRadius: 20
        },
        memberInfo: {
            flex: 1
        },
        memberNameRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4
        },
        memberName: {
            fontWeight: '600'
        },
        username: {
            color: '#6b7280'
        },
        leader: {
            color: '#facc15'
        },
        deputy: {
            color: '#3b82f6'
        }
    });
