import mongoose, { Document, Schema, Model } from 'mongoose';

export type NotificationType = 
  | 'announcement'
  | 'message'
  | 'security'
  | 'achievement'
  | 'transaction'
  | 'team'
  | 'hackathon'
  | 'inquiry'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
  emailSent: boolean;
  smsSent: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['announcement', 'message', 'security', 'achievement', 'transaction', 'team', 'hackathon', 'inquiry', 'system'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String,
    data: Schema.Types.Mixed,
    read: { type: Boolean, default: false },
    readAt: Date,
    emailSent: { type: Boolean, default: false },
    smsSent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
