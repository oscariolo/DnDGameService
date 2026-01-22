import mongoose from 'mongoose';

const diceRollSchema = new mongoose.Schema(
  {
    gameSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameSession',
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    expression: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^(\d+d\d+|\d+)(\+(\d+d\d+|\d+))*(-(\d+d\d+|\d+))*$/.test(v);
        },
        message: 'Invalid dice roll expression',
      },
    },
    result: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

const DiceRoll = mongoose.model('DiceRoll', diceRollSchema);

export default DiceRoll;
