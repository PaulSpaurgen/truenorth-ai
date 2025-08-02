import { type UserData } from "./openai";

export function generateCosmicSystemPrompt(userData: UserData) {

    if(userData.astroSummary && userData.destinySummary){
        return `You are a senior expert in cosmic card interpretation.
        
        USER'S ASTRO SUMMARY:
        ${userData.astroSummary}
        
        USER'S DESTINY SUMMARY:
        ${userData.destinySummary}`
    }
    else {
        return `You are a senior expert in cosmic card interpretation.
        
        USER'S ASTRO SUMMARY:
        ${userData.astroDetailsAsString}
        
        USER'S DESTINY SUMMARY:
        ${userData.destinyCardDetailsAsString}`
    }

}       