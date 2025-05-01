// src/utils/authIntent.js

let loginIntent = false;

export const setLoginIntent = () => {
  loginIntent = true;
};

export const getLoginIntent = () => {
  return loginIntent;
};
