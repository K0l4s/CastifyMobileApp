import { Podcast } from "../models/PodcastModel";

export type RootParamList = {
  Splash: undefined,
  Main: undefined,
  Profile: undefined,
  Podcast: { podcast: Podcast };
}