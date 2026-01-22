/**
 * Application constants
 */

export const GAME_EVENT_TYPES = {
  CHAT: 'chat',
  DICE_ROLL: 'dice-roll',
  ZONE_UPDATE: 'zone-update',
  CHARACTER_UPDATE: 'character-update',
  LEVEL_UP: 'level-up',
  PLAYER_JOIN: 'player-join',
  PLAYER_LEAVE: 'player-leave',
};

export const GAME_SESSION_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  ENDED: 'ended',
};

export const SOCKET_EVENTS = {
  AUTHENTICATE: 'authenticate',
  AUTH_SUCCESS: 'auth-success',
  AUTH_ERROR: 'auth-error',
  CHAT_MESSAGE: 'chat-message',
  ZONE_UPDATE: 'zone-update',
  DICE_ROLL: 'dice-roll',
  CHARACTER_UPDATE: 'character-update',
  LEVEL_UP: 'level-up',
  PLAYER_JOIN: 'player-join',
  PLAYER_LEAVE: 'player-leave',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
};

export const ERROR_MESSAGES = {
  INVALID_TOKEN: 'Invalid or expired token',
  INVALID_SESSION: 'Invalid game session',
  INVALID_PLAYER: 'Invalid player ID',
  SESSION_NOT_FOUND: 'Game session not found',
  PLAYER_NOT_FOUND: 'Player not found',
  DUPLICATE_PLAYER: 'Player already in session',
  INVALID_DICE_EXPRESSION: 'Invalid dice roll expression',
};

export const RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

export const DICE_ROLL_PATTERNS = {
  SIMPLE: /^\d+d\d+$/,
  WITH_MODIFIER: /^(\d+d\d+|\d+)(\+(\d+d\d+|\d+))*(-(\d+d\d+|\d+))*$/,
};
