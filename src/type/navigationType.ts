import { Podcast } from "../models/PodcastModel";

export type RootParamList = {
  Splash: undefined,
  Main: undefined,
  Profile: undefined,
  Podcast: { podcast: Podcast },
  Verify: { token: string },
  RegisterFinal: undefined,
  VerifySuccess: undefined,
}