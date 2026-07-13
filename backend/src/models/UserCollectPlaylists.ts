import mongoose, { Schema, Document } from 'mongoose';

export interface IUserCollectPlaylists extends Document {
    userId: number;
    playlistId: string;
    isCanceled: boolean;
}

const UserCollectPlaylistsSchema: Schema = new Schema({
    userId: {
        type: Number,
        required: [true, '用户ID不能为空'],
        trim: true
    },
    playlistId: {
        type: String,
        required: [true, '播放列表ID不能为空'],
        trim: true
    },
    isCanceled: {
        type: Boolean,
        default: false
    }
});

UserCollectPlaylistsSchema.index({ userId: 1, playlistId: 1 }, { unique: true });

const UserCollectPlaylists = mongoose.model<IUserCollectPlaylists>('user_playlist_collections', UserCollectPlaylistsSchema);
export default UserCollectPlaylists;