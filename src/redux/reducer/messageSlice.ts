import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { shortConversation } from '../../models/Conversation';


interface MessageState {
    conversation: shortConversation[];
    newConversation: shortConversation | null;
}

const initialState: MessageState = {
    conversation: [],
    newConversation: null,
};

const messageSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    receiveMsg(state, action: PayloadAction<shortConversation>) {
      state.conversation.push(action.payload);
      state.newConversation = action.payload;
    }
  }
});

export const { receiveMsg} = messageSlice.actions;
export default messageSlice.reducer;