import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema(
  {
    baseCampaignId: {
      type: String,
      required: true,
    },
    dungeonMasterId: {
      type: String,
      required: true,
    },
    playerIds: {
      type: [String],
      default: [],
    },
    currentZone: {
      type: String,
      default: null,
    },
    gameState: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    playersProgress: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    availableCharacters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['waiting', 'active', 'paused', 'ended'],
      default: 'waiting',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const GameSession = mongoose.model('GameSession', gameSessionSchema);

export default GameSession;
