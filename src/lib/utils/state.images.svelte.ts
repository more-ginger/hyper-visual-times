import { writable } from 'svelte/store';
import visualMentionsNYT from '../../content/data/images/visual_mentions_per_person_and_week_nyt.json';
import visualMentionsZeit from '../../content/data/images/visual_mentions_per_person_and_week_zeit.json';
import coappearanceNYT from '../../content/data/images/visual_coappearance_nyt.json';
import coappearanceZeit from '../../content/data/images/visual_coappearance_zeit.json';
export const selectedView = writable<'bubblechart' | 'streamgraph'>('streamgraph');
export const selectedOutlet = writable<'NYT' | 'Zeit'>('NYT');
export const currentVisualMentionsDataset = writable<any>(visualMentionsNYT);
export const currentCoappearanceDataset = writable<any>(coappearanceNYT);
export const currentColorDefault = writable<string>('var(--color-nyt-default)');
export const currentColorLight = writable<string>('var(--color-nyt-light)');
selectedOutlet.subscribe((outlet) => {
    if (outlet === 'NYT') {
        currentVisualMentionsDataset.set(visualMentionsNYT);
        currentCoappearanceDataset.set(coappearanceNYT);
        currentColorDefault.set('var(--color-nyt-default)');
        currentColorLight.set('var(--color-nyt-light)');
    } else {
        currentVisualMentionsDataset.set(visualMentionsZeit);
        currentCoappearanceDataset.set(coappearanceZeit);
        currentColorDefault.set('var(--color-zeit-default)');
        currentColorLight.set('var(--color-zeit-light)');
    }
});