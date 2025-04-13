import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useSelector } from "react-redux";
import { shortConversation } from "../../models/Conversation";
import { RootState } from "../../redux/store";
import { userCard } from "../../models/User";
import UserService from "../../services/userService";
import { conversationService } from "../../services/conversationService";
import { Button } from "react-native-paper";

interface ConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversations: shortConversation[];
    setConversations: React.Dispatch<React.SetStateAction<shortConversation[]>>;
}

const CreateConversationModal = ({
    isOpen,
    onClose,
    conversations,
    setConversations,
}: ConversationModalProps) => {
    const userId = useSelector((state: RootState) => state.auth.user?.id);
    const [followers, setFollowers] = useState<userCard[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<userCard[]>([]);
    const [conversationName, setConversationName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [pageNumber, setPageNumber] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const pageSize = 10;

    const fetchFollowers = useCallback(
        async (reset = false) => {
            if (isLoading) return;
            setIsLoading(true);
            try {
                const response = await UserService.getFriends(reset ? 0 : pageNumber, pageSize, searchQuery.trim());
                const newData = response.data.data;
                if (reset) {
                    setFollowers(newData);
                    setPageNumber(1);
                } else {
                    setFollowers((prev) => [...prev, ...newData]);
                    setPageNumber((prev) => prev + 1);
                }
                setHasMore(newData.length === pageSize);
            } catch (err) {
                console.error("Failed to fetch followers:", err);
            }
            setIsLoading(false);
        },
        [pageNumber, searchQuery, isLoading]
    );

    useEffect(() => {
        if (isOpen) {
            fetchFollowers(true);
            setSelectedUsers([]);
            setConversationName("");
            setSearchQuery("");
        }
    }, [isOpen]);

    const handleSelectUser = (user: userCard) => {
        setSelectedUsers((prev) => [...prev, user]);
        setFollowers((prev) => prev.filter((f) => f.id !== user.id));
    };

    const handleDeselectUser = (user: userCard) => {
        setFollowers((prev) => [...prev, user]);
        setSelectedUsers((prev) => prev.filter((s) => s.id !== user.id));
    };

    const handleCreateConversation = async () => {
        const currentTime = new Date().toISOString();
        const conversationData = {
            title: conversationName || "New Conversation",
            memberList: [
                {
                    memberId: userId || "",
                    role: "LEADER",
                    joinTime: currentTime,
                    isAccepted: true,
                },
                ...selectedUsers.map((user) => ({
                    memberId: user.id,
                    role: "MEMBER",
                    joinTime: currentTime,
                    isAccepted: true,
                })),
            ],
        };

        try {
            const response = await conversationService.createConversation(conversationData);
            onClose();
            setConversations((prev) => [
                {
                    id: response.data.id,
                    title: response.data.title,
                    imageUrl: response.data.imageUrl,
                    memberSize: response.data.memberSize,
                },
                ...prev,
            ]);
        } catch (error) {
            console.error("Failed to create conversation:", error);
        }
    };

    const renderUserItem = (user: userCard, onPress: (u: userCard) => void, bgColor: string) => (
        <TouchableOpacity
            key={user.id}
            style={[styles.userItem, { backgroundColor: bgColor }]}
            onPress={() => onPress(user)}
        >
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            <View style={styles.userInfo}>
                <Text style={styles.fullname}>{user.fullname}</Text>
                <Text style={styles.username}>@{user.username}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal visible={isOpen} animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.container}
            >
                {/* nút thoát */}
                <TouchableOpacity onPress={onClose} style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 18, color: "#007AFF" }}>Close</Text>
                </TouchableOpacity>
                {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
                
                <Text style={styles.title}>Create Conversation</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter conversation name"
                    value={conversationName}
                    onChangeText={setConversationName}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={() => fetchFollowers(true)}
                />

                <View style={styles.listWrapper}>
                    <Text style={styles.subTitle}>Your Friends</Text>
                    <FlatList
                        data={followers}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => renderUserItem(item, handleSelectUser, "#d1fae5")}
                        onEndReached={() => hasMore && fetchFollowers()}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
                    />
                </View>

                <View style={styles.listWrapper}>
                    <Text style={styles.subTitle}>Selected Users</Text>
                    <FlatList
                        data={selectedUsers}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => renderUserItem(item, handleDeselectUser, "#fee2e2")}
                        ListEmptyComponent={<Text style={styles.empty}>No users selected.</Text>}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        onPress={handleCreateConversation}
                        disabled={selectedUsers.length === 0 || !conversationName.trim()}
                    >
                        Create
                    </Button>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default CreateConversationModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
    },
    listWrapper: {
        flex: 1,
        marginBottom: 16,
    },
    subTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userInfo: {
        flexDirection: "column",
    },
    fullname: {
        fontSize: 14,
        fontWeight: "bold",
    },
    username: {
        fontSize: 13,
        color: "#777",
    },
    empty: {
        color: "#888",
        fontSize: 13,
        fontStyle: "italic",
    },
    buttonContainer: {
        paddingTop: 10,
    },
});
