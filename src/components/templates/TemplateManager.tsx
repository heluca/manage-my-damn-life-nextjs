import { useEffect, useState } from "react"
import { Button, Col, Row, ListGroup } from "react-bootstrap"
import { GlobalViewManager } from "../common/GlobalViewManager/GlobalViewManager"
import AddTemplateForm from "./AddTemplateForm"
import { getTemplatesFromServer } from "@/helpers/frontend/templates"
import { createTaskFromTemplate } from "@/helpers/frontend/templateHelpers"
import { Loading } from "../common/Loading"
import { isDarkModeEnabled } from "@/helpers/frontend/theme"
import { AiOutlineDelete } from "react-icons/ai"
import { getAPIURL } from "@/helpers/general"
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user"
import { toast } from "react-toastify"
import { useTranslation } from "next-i18next"
import { getCalDAVAccountIDFromCalendarID_Dexie, getCalendarbyIDFromDexie } from "@/helpers/frontend/dexie/calendars_dexie"

export default function TemplateManager(){

const {t} = useTranslation()
const [showAddForm, setShowAddForm] = useState(false)
const [finalOutput, setFinalOutput] = useState([<p>{t("NOTHING_TO_SHOW")}</p>])
const [isFetching, setIsFetching] = useState(false)
const [isUsingTemplate, setIsUsingTemplate] = useState(false)
const [selectedCalendarId, setSelectedCalendarId] = useState('')
const [editingTemplate, setEditingTemplate] = useState(null)
useEffect(()=>{
    let isMounted =true
    if(isMounted){

        getAllTemplatesFromServer()
    }
    return ()=>{
        isMounted=false
    }
},[])

const deleteFromServer = async (id) =>{
    const url_api=getAPIURL()+"templates/delete?id="+id
    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'DELETE',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),

    }

    return new Promise( (resolve, reject) => {
            const response =  fetch(url_api, requestOptions as RequestInit)
            .then(response => response.json())
            .then((body) =>{
                toast.success(t("DELETE_OK"))
                getAllTemplatesFromServer()
                }
            ).catch(e =>{
            console.error("AddTemplateForm deleteFromServer",e)
                toast.error(e.message)
            })
    });
  

}

const getAllTemplatesFromServer = async() =>{

    const finalOutput: JSX.Element[] = []
    const response = await getTemplatesFromServer()
    const borderColor = isDarkModeEnabled() ? "white" : "#F1F1F1"
    console.log("response", response)
    if(response && Array.isArray(response)){
        for(const i in response){
            let row=(
                <>
                <div className="card" key={i+"_"+"templateName"} style={{border:`1px solid ${borderColor}`, padding: 20, marginBottom:20, borderRadius: 20}}>
                <Row>
                <Col lg={10}>
                <h3>{response[i]["name"]}</h3>
                <p>{t("TYPE")}:{response[i]["type"]}</p>
                <pre>
                    <code>
                    {JSON.stringify(JSON.parse(response[i]["data"]), null, 4)}
                    </code>
                </pre>
                {(() => {
                    try {
                        const templateData = JSON.parse(response[i]["data"]);
                        if (templateData && templateData.childTasks && templateData.childTasks.length > 0) {
                            return (
                                <div className="mt-3">
                                    <h5>{t("CHILD_TASKS") || "Child Tasks"}</h5>
                                    <ListGroup>
                                        {templateData.childTasks.map((task, index) => (
                                            <ListGroup.Item key={index}>
                                                <div><strong>{task.summary}</strong></div>
                                                {task.description && <div className="text-muted small">{task.description}</div>}
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </div>
                            );
                        }
                        return null;
                    } catch (e) {
                        console.error("Error parsing template data:", e);
                        return null;
                    }
                })()}
                </Col>
                <Col style={{textAlign:"right"}} lg={2}>
                <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => useTemplate(response[i])}
                >
                    {t("USE_TEMPLATE")}
                </Button>
                <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => editTemplate(response[i])}
                >
                    {t("EDIT")}
                </Button>
                <AiOutlineDelete 
                    onClick={() => deleteFromServer(response[i]["id"])} 
                    color="red" 
                    style={{ cursor: 'pointer' }} 
                />
                </Col>
                </Row>
                
                </div>
                
                
                </>
            )
            finalOutput.push(row)
        }
        if(finalOutput.length>0){

            setFinalOutput(finalOutput)
        }   else{
            setFinalOutput([<p>{t("NOTHING_TO_SHOW")}</p>])
        }     
    }
    setIsFetching(false)


}

const addButtonClicked = () =>{
    setEditingTemplate(null)
    setShowAddForm(true)
}

const editTemplate = (template) => {
    setEditingTemplate(template)
    setShowAddForm(true)
}

const closeAddForm =() =>{
    getAllTemplatesFromServer()
    setShowAddForm(false)
    setEditingTemplate(null)
}

const useTemplate = async (template) => {
    try {
        // Parse the template data
        const templateData = JSON.parse(template.data);
        
        if (template.type === 'TASK') {
            // Get default calendar ID from localStorage or prompt user to select one
            const defaultCalendarId = localStorage.getItem('DEFAULT_CALENDAR_ID');
            
            if (defaultCalendarId) {
                setIsUsingTemplate(true);
                
                // Get calendar data
                const calendarData = await getCalendarbyIDFromDexie(defaultCalendarId);
                if (!calendarData || !calendarData[0]) {
                    toast.error(t("ERROR_GETTING_CALENDAR_DATA"));
                    setIsUsingTemplate(false);
                    return;
                }
                
                // Get CalDAV account ID
                const caldavAccountsId = await getCalDAVAccountIDFromCalendarID_Dexie(defaultCalendarId);
                if (!caldavAccountsId) {
                    toast.error(t("ERROR_GETTING_CALDAV_ACCOUNT"));
                    setIsUsingTemplate(false);
                    return;
                }
                
                // Create the task from template
                await createTaskFromTemplate(templateData, defaultCalendarId, caldavAccountsId, calendarData[0]);
                
                toast.success(t("TEMPLATE_APPLIED"));
                setIsUsingTemplate(false);
            } else {
                toast.error(t("NO_DEFAULT_CALENDAR"));
            }
        } else {
            toast.info(t("EVENT_TEMPLATES_NOT_SUPPORTED"));
        }
    } catch (error) {
        console.error("Error using template:", error);
        toast.error(t("ERROR_USING_TEMPLATE"));
        setIsUsingTemplate(false);
    }
}


return(
    <>
    <div style={{padding:40}} className='container-fluid'>
    <h1>{t("TEMPLATE_MANAGER")}</h1>
    {!showAddForm? <div style={{textAlign: "right"}}><Button size="sm" onClick={addButtonClicked} >{t("ADD")}</Button></div> : <AddTemplateForm closeAddForm={closeAddForm} editingTemplate={editingTemplate} />}
    <div style={{padding:40}}>
        {isFetching || isUsingTemplate ? <Loading centered={true} /> : finalOutput}
    </div>
    </div>
    <GlobalViewManager />

    </>
)
}
