import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (() => {
    // For now, I am loading the data from GitHub
    const getNetworkData = fetch("https://raw.githubusercontent.com/more-ginger/pn-analysis/refs/heads/main/data/network.json")
        .then(response => {
            return response.json()
        })
        .catch(() => {
            console.log(error)
            return error
        })

    return {
        networkData: new Promise((resolve) => {
            getNetworkData
                .then(data => {
                    return resolve(data)
                })
                .catch((error) => {
                    console.log(error)
                })
        })
    }
}) satisfies PageServerLoad;