export const USERNAME_REGEX = /^(?=.*[a-zA-Z])[a-zA-Z0-9][a-zA-Z0-9_-]{1,31}$/;

export const URL_REGEX =
	/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

export const INSTAGRAM_USER_REGEX = /^@?[a-zA-Z0-9._]{1,30}$/;
export const FACEBOOK_USER_REGEX = /^[a-zA-Z0-9.]{5,50}$/;
export const X_USER_REGEX = /^@?[a-zA-Z0-9_]{1,15}$/;
export const TIKTOK_USER_REGEX = /^@?[a-zA-Z0-9_.]{1,24}$/;
export const GITHUB_USER_REGEX =
	/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
