import React, { useCallback, useEffect, useState } from "react";
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
import Ionicons from "react-native-vector-icons/Ionicons";

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
                {/* Nút đóng */}
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>

                <Text style={styles.title}>Create Conversation</Text>

                {/* Tên nhóm */}
                <View style={styles.inputLabelWrapper}>
                    <Text style={styles.inputLabel}>Conversation Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter conversation name"
                        value={conversationName}
                        onChangeText={setConversationName}
                    />
                </View>



                {/* Danh sách bạn */}
                <View style={styles.listWrapper}>
                    <Text style={styles.subTitle}>Your Friends</Text>
                    {/* Tìm bạn */}
                    <View style={styles.inputLabelWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Search friends..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={() => fetchFollowers(true)}
                        />
                    </View>
                    <FlatList
                        data={followers}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => renderUserItem(item, handleSelectUser, "#e0f7f4")}
                        onEndReached={() => hasMore && fetchFollowers()}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
                    />
                </View>

                {/* Người được chọn */}
                <View style={styles.listWrapper}>
                    <Text style={styles.subTitle}>Selected Users</Text>
                    <FlatList
                        data={selectedUsers}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => renderUserItem(item, handleDeselectUser, "#fbe8e8")}
                        ListEmptyComponent={<Text style={styles.empty}>No users selected.</Text>}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        onPress={handleCreateConversation}
                        disabled={selectedUsers.length === 0 || !conversationName.trim()}
                        contentStyle={styles.createButtonContent}
                        labelStyle={styles.createButtonLabel}
                        style={styles.createButton}
                    >
                        Create
                    </Button>
                </View>

                {isLoading && <ActivityIndicator size="large" color="#007AFF" />}
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
    closeButton: {
        alignSelf: "flex-end",
        padding: 4,
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
        color: "#333",
    },
    inputLabelWrapper: {
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
        color: "#555",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    listWrapper: {
        flex: 1,
        marginTop: 8,
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
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: "#f0f0f0",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
        elevation: 2,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginRight: 12,
    },
    userInfo: {
        flexDirection: "column",
    },
    fullname: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#222",
    },
    username: {
        fontSize: 13,
        color: "#777",
    },
    empty: {
        color: "#888",
        fontSize: 13,
        fontStyle: "italic",
        marginTop: 10,
        textAlign: "center",
    },
    buttonContainer: {
        paddingTop: 10,
    },
    createButton: {
        borderRadius: 12,
        elevation: 3,
    },
    createButtonContent: {
        paddingVertical: 10,
    },
    createButtonLabel: {
        fontSize: 16,
        fontWeight: "bold",
    },
});
