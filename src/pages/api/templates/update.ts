import { updateTemplateInDB } from "@/helpers/api/template"
import { getUserIDFromLogin, middleWareForAuthorisation } from "@/helpers/api/user"

export default async function handler(req, res) {
    if (req.method === 'POST') {
        if (await middleWareForAuthorisation(req, res)) {
            if (req.body.name && req.body.data && req.body.type && req.body.id) {
                const userid = await getUserIDFromLogin(req, res)
                if (userid == null) {
                    return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN' } })
                }
                
                const jsonToInsert = JSON.stringify(req.body.data)
                await updateTemplateInDB(req.body.id, req.body.name, jsonToInsert, req.body.type, userid.toString())
                res.status(200).json({ success: true, data: { message: "UPDATE_OK" } })
            } else {
                return res.status(422).json({ success: false, data: { message: 'INVALID_INPUT' } })
            }
        } else {
            return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN' } })
        }
    } else {
        return res.status(403).json({ success: 'false', data: { message: 'INVALID_METHOD' } })
    }
}