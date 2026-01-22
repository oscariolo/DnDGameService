import mongoose from 'mongoose';

const gameEventSchema = new mongoose.Schema(
  {
    gameSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameSession',
      required: true,
    },
    type: {
      type: String,
      enum: ['chat', 'dice-roll', 'zone-update', 'character-update', 'level-up', 'player-join', 'player-leave'],
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

const GameEvent = mongoose.model('GameEvent', gameEventSchema);

export default GameEvent;
