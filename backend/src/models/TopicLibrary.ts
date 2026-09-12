import mongoose, { Document, Schema } from 'mongoose';

export interface ISubtopic {
  title: string;
  order: number;
}

export interface ITopic {
  title: string;
  order: number;
  subtopics?: ISubtopic[];
}

export interface ITopicLibrary extends Document {
  subject: string;
  normalizedSubject: string;
  topics: ITopic[];
  source: 'hardcoded' | 'ai';
  createdAt: Date;
  updatedAt: Date;
}

const SubtopicSchema = new Schema<ISubtopic>({
  title: { type: String, required: true },
  order: { type: Number, required: true }
});

const TopicSchema = new Schema<ITopic>({
  title: { type: String, required: true },
  order: { type: Number, required: true },
  subtopics: [SubtopicSchema]
});

const TopicLibrarySchema = new Schema<ITopicLibrary>({
  subject: { type: String, required: true },
  normalizedSubject: { type: String, required: true, unique: true, index: true },
  topics: [TopicSchema],
  source: { type: String, enum: ['hardcoded', 'ai'], default: 'ai' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITopicLibrary>('TopicLibrary', TopicLibrarySchema);
