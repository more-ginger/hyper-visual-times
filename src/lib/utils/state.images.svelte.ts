import { writable } from 'svelte/store';
export const selectedView = writable<'bubblechart' | 'streamgraph'>('streamgraph');