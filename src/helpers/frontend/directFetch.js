import { getAPIURL } from "../general";
import { getAuthenticationHeadersforUser } from "./user";

/**
 * Directly fetch events from the server for a specific calendar
 * This is a fallback method when Dexie doesn't have events
 */
export async function directFetchEventsFromServer(caldav_accounts_id, calendar_id) {
    const url_api = getAPIURL() + `v2/calendars/events/direct?caldav_accounts_id=${caldav_accounts_id}&calendar_id=${calendar_id}`;
    const authorisationData = await getAuthenticationHeadersforUser();

    const requestOptions = {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),
    };

    try {
        const response = await fetch(url_api, requestOptions);
        const data = await response.json();
        
        if (data && data.success && data.data && data.data.message) {
            console.log(`Direct fetch successful for calendar ${calendar_id}, found ${data.data.message.length} events`);
            return data.data.message;
        } else {
            console.error("Direct fetch failed:", data);
            return null;
        }
    } catch (error) {
        console.error("Error in directFetchEventsFromServer:", error);
        return null;
    }
}