import { articleTools } from '@/service/agent-tools/article.tools';
import { songsTools } from '@/service/agent-tools/songs.tools';
import { playlistsTools } from '@/service/agent-tools/playlists.tools';
import { tagsTools } from '@/service/agent-tools/tags.tools';
import { categoriesTools } from '@/service/agent-tools/categories.tools';
import { timelineTools } from '@/service/agent-tools/timeline.tools';
import { treeholeTools } from '@/service/agent-tools/treehole.tools';
import { quotesTools } from '@/service/agent-tools/quotes.tools';

export const allTools = [
    ...articleTools,
    ...songsTools,
    ...playlistsTools,
    ...tagsTools,
    ...categoriesTools,
    ...timelineTools,
    ...treeholeTools,
    ...quotesTools
];
