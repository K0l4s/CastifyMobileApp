import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { shortConversation } from '../../models/Conversation';


interface MessageState {
    conversation: shortConversation[];
    newConversation: shortConversation | null;
    isClick:boolean
}

const initialState: MessageState = {
    conversation: [],
    newConversation: null,
    isClick:true,
};

const messageSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    receiveMsg(state, action: PayloadAction<shortConversation>) {
      state.conversation.push(action.payload);
      state.newConversation = action.payload;
    },
    resetNewConversation(state) {
      state.newConversation = null;
    },
    setClick(state,action: PayloadAction<boolean>){
      state.isClick = action.payload;
    }
  }
});

export const { receiveMsg,resetNewConversation,setClick} = messageSlice.actions;
export default messageSlice.reducer;