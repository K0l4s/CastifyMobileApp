import { Podcast } from "../models/PodcastModel";

export type RootParamList = {
  Splash: undefined,
  Main: undefined,
  Profile: { username: string},
  Podcast: { podcast: Podcast },
  Verify: { token: string },
  RegisterFinal: undefined,
  VerifySuccess: undefined,
  ChatScreen: undefined,
  ChatDetailScreen: { conversationId: string },
  ChatSettingScreen: { conversationId: string },
  Create: undefined,
  Notification: undefined;
  Search: undefined;
  AllFollowingUsers: undefined;
  ViewedHistory: undefined;
}
