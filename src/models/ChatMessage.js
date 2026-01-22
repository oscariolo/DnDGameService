import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
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
    messageContent: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
