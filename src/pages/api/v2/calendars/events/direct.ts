import { getCaldavClient } from "@/helpers/api/cal/caldav";
import { Calendars } from "@/helpers/api/classes/Calendars";
import { getUserIDFromLogin, middleWareForAuthorisation } from "@/helpers/api/user";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        if(await middleWareForAuthorisation(req,res)) {
            if(!req.query.caldav_accounts_id || !req.query.calendar_id) {
                return res.status(422).json({ version:2, success: false, data: { message: 'INVALID_INPUT'} });
            }
            
            const userid = await getUserIDFromLogin(req, res);
            if(userid==null) {
                return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} });
            }

            // Get calendar directly using the Calendars class
            const calendar = await Calendars.getFromID(req.query.calendar_id);
            
            if(calendar) {
                try {
                    const client = await getCaldavClient(req.query.caldav_accounts_id);
                    if(client) {
                        // Fetch all calendar objects directly
                        // Make sure calendar.url is defined before using it
                        if (!calendar || !calendar.url) {
                            return res.status(404).json({ success: false, data: { message: 'CALENDAR_URL_NOT_FOUND'} });
                        }
                        
                        const calendarObjects = await client.fetchCalendarObjects({
                            calendar: {url: calendar.url as string},
                            filters: [
                                {
                                    'comp-filter': {
                                        _attributes: {
                                            name: 'VCALENDAR',
                                        },
                                    },
                                },
                            ],
                        });
                        
                        return res.status(200).json({ 
                            version: 2, 
                            success: true, 
                            data: { 
                                message: calendarObjects,
                                count: calendarObjects ? calendarObjects.length : 0
                            } 
                        });
                    } else {
                        return res.status(500).json({ success: false, data: { message: 'CALDAV_CLIENT_ERROR'} });
                    }
                } catch (error) {
                    console.error("Direct fetch error:", error);
                    return res.status(500).json({ success: false, data: { message: 'SERVER_ERROR', error: error.message } });
                }
            } else {
                return res.status(404).json({ success: false, data: { message: 'CALENDAR_NOT_FOUND'} });
            }
        } else {
            return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} });
        }
    } else {
        return res.status(405).json({ success: false, data: {message: 'METHOD_NOT_ALLOWED'} });
    }
}