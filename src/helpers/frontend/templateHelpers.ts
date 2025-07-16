import { getRandomString } from "@/helpers/crypto";
import { getCalendarURLByID_Dexie } from "./dexie/calendars_dexie";
import { saveEventToDexie } from "./dexie/events_dexie";
import { postNewEvent } from "./events";
import { generateNewTaskObject } from "./tasks";
import VTodoGenerator from 'vtodogenerator';
import { toast } from "react-toastify";
import { getI18nObject } from "./general";

/**
 * Creates a task from a template, including any child tasks
 * @param templateData The template data
 * @param calendarId The calendar ID to create the task in
 * @param caldavAccountsId The CalDAV account ID
 * @param calendarData The calendar data object
 * @returns Promise that resolves when all tasks are created
 */
export async function createTaskFromTemplate(templateData, calendarId, caldavAccountsId, calendarData) {
    const i18next = getI18nObject();
    
    try {
        // Create the main task
        const mainTaskData = templateData.data;
        const mainTaskResult = await createSingleTask(
            mainTaskData,
            calendarId,
            caldavAccountsId,
            calendarData
        );
        
        // If there are child tasks, create them with a relation to the main task
        if (templateData.childTasks && Array.isArray(templateData.childTasks) && templateData.childTasks.length > 0) {
            const mainTaskUid = mainTaskData.uid || mainTaskResult?.uid;
            
            if (!mainTaskUid) {
                console.error("Failed to get main task UID for child task creation");
                return;
            }
            
            // Create each child task
            for (const childTask of templateData.childTasks) {
                // Create a basic task object for the child
                const childTaskData = {
                    summary: childTask.summary,
                    description: childTask.description || "",
                    due: mainTaskData.due || "",
                    start: mainTaskData.start || "",
                    status: "NEEDS-ACTION",
                    priority: mainTaskData.priority || "",
                    uid: getRandomString(32),
                    calendar_id: calendarId,
                    // Add relation to parent task
                    relatedto: [{
                        "reltype": "PARENT",
                        "uid": mainTaskUid
                    }]
                };
                
                await createSingleTask(
                    childTaskData,
                    calendarId,
                    caldavAccountsId,
                    calendarData
                );
            }
            
            toast.success(i18next.t("TEMPLATE_WITH_CHILDREN_CREATED") || "Task created with child tasks");
        }
        
        return mainTaskResult;
    } catch (error) {
        console.error("Error creating task from template:", error);
        toast.error(i18next.t("ERROR_CREATING_TASK_FROM_TEMPLATE") || "Error creating task from template");
        throw error;
    }
}

/**
 * Creates a single task
 * @param taskData The task data
 * @param calendarId The calendar ID
 * @param caldavAccountsId The CalDAV account ID
 * @param calendarData The calendar data object
 * @returns Promise that resolves with the created task
 */
async function createSingleTask(taskData, calendarId, caldavAccountsId, calendarData) {
    // Generate a new task object
    const finalTodoData = await generateNewTaskObject(taskData, {}, null);
    
    // Generate the VTODO
    const todo = new VTodoGenerator(finalTodoData, { strict: false });
    const finalVTODO = todo.generate();
    
    // Generate etag and filename
    const etag = getRandomString(32);
    const fileName = getRandomString(64) + ".ics";
    
    // Construct URL
    let url = calendarData["url"];
    const lastChar = url.substr(-1);
    if (lastChar != '/') {
        url = url + '/';
    }
    url += fileName;
    
    // Save to Dexie and post to server
    await saveEventToDexie(calendarId, url, etag, finalVTODO, "VTODO");
    
    // Post to server
    await postNewEvent(
        calendarId,
        finalVTODO,
        etag,
        caldavAccountsId,
        calendarData["ctag"],
        calendarData["syncToken"],
        calendarData["url"],
        "VTODO",
        fileName
    );
    
    return {
        uid: finalTodoData.uid,
        url: url,
        etag: etag
    };
}