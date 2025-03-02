export type UserAction<T> = T & { userId: number };
export type UserToCreatorAction<T> = T & UserAction<{ creatorId: number }>;
export type UserToProjectAction<T> = T & UserAction<{ projectId: number }>;
