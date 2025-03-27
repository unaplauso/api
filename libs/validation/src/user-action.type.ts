export type UserAction<T = unknown> = T & { userId: number };
export type UserToCreatorAction<T = unknown> = T &
	UserAction<{ creatorId: number }>;
export type UserToProjectAction<T = unknown> = T &
	UserAction<{ projectId: number }>;
