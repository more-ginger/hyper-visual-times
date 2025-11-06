import { writable } from 'svelte/store';
export const selectedView = writable<'bubblechart' | 'streamgraph'>('streamgraph');
export const selectedOutlet = writable<'NYT' | 'Zeit'>('NYT');