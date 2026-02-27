import { create } from 'zustand';

interface UserInfo {
    _id: string;
    name: string;
    avatar?: string;
}

interface CallState {
    isActive: boolean;
    isIncoming: boolean;
    caller: UserInfo | null;
    isVideo: boolean;
    startCall: (user: UserInfo, isVideo?: boolean) => void;
    receiveCall: (user: UserInfo, isVideo?: boolean) => void;
    acceptCall: () => void;
    endCall: () => void;
}

export const useCallStore = create<CallState>((set) => ({
    isActive: false,
    isIncoming: false,
    caller: null,
    isVideo: false,
    startCall: (user: UserInfo, isVideo = false) => set({ isActive: true, isIncoming: false, caller: user, isVideo }),
    receiveCall: (user: UserInfo, isVideo = false) => set({ isActive: true, isIncoming: true, caller: user, isVideo }),
    acceptCall: () => set({ isIncoming: false }),
    endCall: () => set({ isActive: false, isIncoming: false, caller: null, isVideo: false }),
}));
