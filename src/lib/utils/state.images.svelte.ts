import * as d3 from 'd3';
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
const colorScheme = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'
]
export const colorScale = writable(d3.scaleOrdinal([...new Set(coappearanceNYT.map((d) => Object.keys(d.news_desks)).flat())], colorScheme))
selectedOutlet.subscribe((outlet) => {
    if (outlet === 'NYT') {
        currentVisualMentionsDataset.set(visualMentionsNYT);
        currentCoappearanceDataset.set(coappearanceNYT);
        currentColorDefault.set('var(--color-nyt-default)');
        currentColorLight.set('var(--color-nyt-light)');
        colorScale.set(d3.scaleOrdinal([...new Set(coappearanceNYT.map((d) => Object.keys(d.news_desks)).flat())], colorScheme))
    } else {
        currentVisualMentionsDataset.set(visualMentionsZeit);
        currentCoappearanceDataset.set(coappearanceZeit);
        currentColorDefault.set('var(--color-zeit-default)');
        currentColorLight.set('var(--color-zeit-light)');
        colorScale.set(d3.scaleOrdinal([...new Set(coappearanceZeit.map((d) => Object.keys(d.news_desks)).flat())], colorScheme))
    }
});