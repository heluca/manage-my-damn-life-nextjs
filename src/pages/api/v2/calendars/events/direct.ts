import { getCaldavClient } from "@/helpers/api/cal/caldav";
import { User } from "@/helpers/api/classes/User";
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

            const userObj = new User(userid);
            const calendar = await userObj.getCalendarFromID(req.query.calendar_id);
            
            if(calendar) {
                try {
                    const client = await getCaldavClient(req.query.caldav_accounts_id);
                    if(client) {
                        // Fetch all calendar objects directly
                        const calendarObjects = await client.fetchCalendarObjects({
                            calendar: {url: calendar.url},
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