import { getI18nObject } from "@/helpers/frontend/general"
import { MouseEventHandler, useEffect, useState } from "react"
import { Button, Form, ListGroup, Badge } from "react-bootstrap"
import { GlobalViewManager } from "../common/GlobalViewManager/GlobalViewManager"
import { showTaskEditorAtom, taskEditorInputAtom } from "stateStore/TaskEditorStore"
import { useSetAtom } from "jotai"
import { eventEditorInputAtom, showEventEditorAtom } from "stateStore/EventEditorStore"
import { getEventURLFromDexie } from "@/helpers/frontend/dexie/events_dexie"
import { getCalendarURLByID_Dexie } from "@/helpers/frontend/dexie/calendars_dexie"
import { toast } from "react-toastify"
import { getAPIURL } from "@/helpers/general"
import { getAuthenticationHeadersforUser } from "@/helpers/frontend/user"
import { Loading } from "../common/Loading"
import { RequestOptions } from "https"
import { getErrorResponse } from "@/helpers/errors"
import { AiOutlineDelete, AiOutlinePlus } from "react-icons/ai"

export default function AddTemplateForm({closeAddForm, editingTemplate}:{closeAddForm: Function, editingTemplate?: any}){

const i18next = getI18nObject()

/**
 * Jotai
 */

const showTaskEditor = useSetAtom(showTaskEditorAtom)
const setTaskInputAtom = useSetAtom(taskEditorInputAtom)

const showEventEditor = useSetAtom(showEventEditorAtom)
const setEventInputAtom = useSetAtom(eventEditorInputAtom)

/**
 * Local State
 */
const [name, setName] = useState('')
const [type, setType] = useState('TASK')
const [data, setData] = useState({calendar_id:"", data:""})
const [isSubmitting, setIsSubmitting] = useState(false)
const [childTasks, setChildTasks] = useState<Array<{summary: string, description: string}>>([]) 
const [showAddChildForm, setShowAddChildForm] = useState(false)
const [childTaskSummary, setChildTaskSummary] = useState('')
const [childTaskDescription, setChildTaskDescription] = useState('')
const [templateId, setTemplateId] = useState(null)

// Load template data when editing
useEffect(() => {
    if (editingTemplate) {
        setName(editingTemplate.name)
        setType(editingTemplate.type)
        setTemplateId(editingTemplate.id)
        
        try {
            const parsedData = JSON.parse(editingTemplate.data)
            setData(parsedData)
            
            // Load child tasks if they exist
            if (parsedData.childTasks && Array.isArray(parsedData.childTasks)) {
                setChildTasks(parsedData.childTasks)
            }
        } catch (error) {
            console.error("Error parsing template data:", error)
            toast.error(i18next.t("ERROR_PARSING_TEMPLATE"))
        }
    }
}, [editingTemplate])

const nameChanged = (e) =>{
    setName(e.target.value)
}
const typeChanged = (e) =>{
    setType(e.target.value)
}

const onTaskValueReturn = (dataFromEditor) =>{
    if(("calendar_id" in dataFromEditor) && dataFromEditor["calendar_id"])
    {
        getCalendarURLByID_Dexie(parseInt(dataFromEditor["calendar_id"])) .then(url =>{
            // console.log(dataFromEditor["calendar_id"],url)
            dataFromEditor["calendar_id"]=url
            setData(dataFromEditor)
        })
    }else{
        setData(dataFromEditor)
    }
}

const addChildTask = () => {
    if (!childTaskSummary.trim()) {
        toast.error(i18next.t("ENTER_TASK_SUMMARY"))
        return
    }
    
    setChildTasks([...childTasks, {
        summary: childTaskSummary,
        description: childTaskDescription
    }])
    
    // Reset form fields
    setChildTaskSummary('')
    setChildTaskDescription('')
    setShowAddChildForm(false)
}

const removeChildTask = (index) => {
    const updatedChildTasks = [...childTasks]
    updatedChildTasks.splice(index, 1)
    setChildTasks(updatedChildTasks)
}
const createDataClicked = () =>{
    if(type=="TASK"){
        setTaskInputAtom({
            id:null,
            isTemplate:true,
            templateReturn:onTaskValueReturn
        })
        showTaskEditor(true)
    }else{
        setEventInputAtom({
            id:null,
            isTemplate:true,
            templateReturn:onTaskValueReturn
        })
        showEventEditor(true)
    }
}

const isValid = () =>{

    if(!name.trim()){
        toast.error(i18next.t("ENTER_TEMPLATE_NAME"))
        return false
    }
    if(!("data in data"))
    {
        toast.error(i18next.t("ENTER_TEMPLATE_DATA"))
        return false

    }
    if(!data.data)
    {
        toast.error(i18next.t("ENTER_TEMPLATE_DATA"))
        return false

    }
    return true
}


const onSave = async () =>{

    if(isValid()){
        setIsSubmitting(true)
        const isEditing = templateId !== null
        const url_api = getAPIURL() + (isEditing ? `templates/update` : "templates/create")
        const authorisationData = await getAuthenticationHeadersforUser()
        
        // Prepare template data with child tasks
        const templateData = {
            ...data,
            childTasks: childTasks
        }
        
        // Create request body with proper typing
        const requestBody: {
            name: string;
            data: any;
            type: string;
            id?: number | null;
        } = {
            name: name,
            data: templateData,
            type: type,
        }
        
        // Add id for updates
        if (isEditing) {
            requestBody.id = templateId
        }
    
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: new Headers({'authorization': authorisationData, 'Content-Type':'application/json'}),
        }
    
        return new Promise( (resolve, reject) => {
           
                const response = fetch(url_api, requestOptions)
                .then(response => response.json())
                .then((body) =>{
                    //Save the events to db.
                    if(body!=null)
                    {
                        if(body.success==true)
                        {
                            toast.success(i18next.t(isEditing ? "UPDATE_OK" : "DONE"))
                            closeAddForm()
    
                        }else{
                            toast.error(i18next.t(body.data.message))
                        }
                    }
                    else
                    {
                        toast.error(i18next.t("ERROR_GENERIC"))
    
                    }
                    
        
                }).catch(e =>{
                    console.error(e, "AddTemplate onSave:")
                    toast.error(e.message)
                })
            
        })

    }
}

const dataToShow = ("data" in data && data.data) ? <p>{JSON.stringify(data)}</p> : <Button onClick={createDataClicked}>{i18next.t("CREATE")}</Button>

// Child tasks UI components
const childTasksList = (
    <div style={{ marginTop: 20 }}>
        <h5>{i18next.t("CHILD_TASKS") || "Child Tasks"}</h5>
        {childTasks.length > 0 ? (
            <ListGroup>
                {childTasks.map((task, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                        <div>
                            <div><strong>{task.summary}</strong></div>
                            {task.description && <div className="text-muted small">{task.description}</div>}
                        </div>
                        <Button 
                            variant="link" 
                            className="text-danger" 
                            onClick={() => removeChildTask(index)}
                        >
                            <AiOutlineDelete />
                        </Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        ) : (
            <p className="text-muted">{i18next.t("NO_CHILD_TASKS") || "No child tasks added yet"}</p>
        )}
        
        {showAddChildForm ? (
            <div className="mt-3 p-3 border rounded">
                <Form.Group className="mb-3">
                    <Form.Label>{i18next.t("TASK_SUMMARY") || "Task Summary"}</Form.Label>
                    <Form.Control 
                        value={childTaskSummary}
                        onChange={(e) => setChildTaskSummary(e.target.value)}
                        placeholder={i18next.t("ENTER_TASK_SUMMARY") || "Enter task summary"}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>{i18next.t("DESCRIPTION") || "Description"}</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={3}
                        value={childTaskDescription}
                        onChange={(e) => setChildTaskDescription(e.target.value)}
                        placeholder={i18next.t("ENTER_DESCRIPTION") || "Enter description"}
                    />
                </Form.Group>
                <div className="d-flex justify-content-end">
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        className="me-2" 
                        onClick={() => setShowAddChildForm(false)}
                    >
                        {i18next.t("CANCEL") || "Cancel"}
                    </Button>
                    <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={addChildTask}
                    >
                        {i18next.t("ADD") || "Add"}
                    </Button>
                </div>
            </div>
        ) : (
            <Button 
                variant="outline-primary" 
                size="sm" 
                className="mt-2" 
                onClick={() => setShowAddChildForm(true)}
            >
                <AiOutlinePlus /> {i18next.t("ADD_CHILD_TASK") || "Add Child Task"}
            </Button>
        )}
    </div>
);

const buttons = <p style={{marginTop: 40, textAlign:"center"}}>
<Button onClick={() =>closeAddForm()} style={{marginRight:"20px"}} variant="secondary">{i18next.t("BACK")}</Button>
<Button onClick={onSave} variant="primary">{i18next.t("SAVE")}</Button>

</p>

return(
    <>
    <div style={{padding:40}} className='container-fluid'>
    <h2>{templateId ? i18next.t("EDIT") : i18next.t("ADD")}</h2>
    <br />
    <Form.Label htmlFor="templateName">{`${i18next.t("TEMPLATE")} ${i18next.t("NAME")}`}</Form.Label>
    <Form.Control id="templateName" maxLength={50} onChange={nameChanged} value={name}  />
    <br />
    <Form.Label htmlFor="templateType">{`${i18next.t("TYPE")}`}</Form.Label>
    <Form.Select id="templateType" value={type} onChange={typeChanged} aria-label="Type Select">
      <option value="TASK">{i18next.t("TASK")}</option>
      <option value="EVENT">{i18next.t("EVENT")}</option>
    </Form.Select>
    <br/>
    <Form.Label htmlFor="templateData">{`${i18next.t("TEMPLATE")} ${i18next.t("DATA")}`}</Form.Label>
    <br />
    {dataToShow}
    <br />
    {type === 'TASK' && childTasksList}
    <br />
    {isSubmitting ? <Loading centered={true} /> :  buttons}
    </div>
    <GlobalViewManager />

    </>
)
}
