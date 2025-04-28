import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the Message document
export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  read: boolean;
  conversationId: string; // Or mongoose.Types.ObjectId if referencing a Conversation model
}

// Define the Mongoose schema for the Message model
const MessageSchema: Schema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
  conversationId: {
    type: String, // Using String for simplicity now, could change to ObjectId later
    required: true,
    index: true, // Index for faster querying of conversations
  },
});

// Create and export the Message model
const Message = mongoose.model<IMessage>('Message', MessageSchema);

export default Message; 