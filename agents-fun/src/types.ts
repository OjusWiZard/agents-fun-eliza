import { ROOMS } from './config/index'

export type RoomKey = keyof typeof ROOMS // "TOKEN_INTERACTION" | "TWITTER_INTERACTION"
