import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (() => {
    // For now, I am loading the data from GitHub
    const getFlowData = fetch("https://raw.githubusercontent.com/more-ginger/pn-analysis/refs/heads/main/data/categories-over-time.json")
        .then(response => {
            return response.json()
        })
        .catch(() => {
            console.log(error)
            return error
        })

    return {
        flowData: new Promise((resolve) => {
            getFlowData
                .then(data => {
                    return resolve(data)
                })
                .catch((error) => {
                    console.log(error)
                })
        })
    }
}) satisfies PageServerLoad;