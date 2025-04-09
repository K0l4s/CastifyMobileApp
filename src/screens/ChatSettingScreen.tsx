import { View, Text } from 'react-native'
import React from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';

const ChatSettingScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { conversationId } = route.params as { conversationId: string };

    return (
        <View>
            <Text>ChatSettingScreen</Text>
        </View>
    )
}

export default ChatSettingScreen