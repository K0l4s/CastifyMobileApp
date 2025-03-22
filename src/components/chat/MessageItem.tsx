import React from 'react';
import { View, Text, Image } from 'react-native';
import DateUtil from '../../utils/dateUtil';

interface Props {
  message: {
    id: string;
    sender: { id: string; fullname: string; avatarUrl?: string };
    content: string;
    timestamp: string;
  };
  isMyMessage: boolean;
}

const MessageItem = ({ message, isMyMessage }: Props) => {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 5,
      paddingHorizontal: 10,
      justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
    }}>
      {!isMyMessage && (
        <Image
          source={{ uri: message.sender.avatarUrl || 'https://i.imgur.com/2vP3hDA.png' }}
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
        />
      )}

      <View style={{
        maxWidth: '75%',
        backgroundColor: isMyMessage ? '#FFD700' : '#E5E5E5',
        padding: 10,
        borderRadius: 15,
        alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
        marginLeft: isMyMessage ? 'auto' : 0,
      }}>
        {!isMyMessage && (
          <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>
            {message.sender.fullname}
          </Text>
        )}
        <Text style={{ color: isMyMessage ? 'black' : 'black' }}>
          {message.content}
        </Text>
        <Text style={{ fontSize: 10, color: 'gray', marginTop: 5 }}>
          {DateUtil.formatDateToTimeAgo(new Date(message.timestamp))}
        </Text>
      </View>
    </View>
  );
};

export default React.memo(MessageItem);
