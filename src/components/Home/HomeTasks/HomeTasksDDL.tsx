import { MYDAY_LABEL } from "@/config/constants"
import { getTodaysDateUnixTimeStamp, varNotEmpty } from "@/helpers/general"
import { PAGE_VIEW_JSON } from "@/helpers/viewHelpers/pages"
import { useEffect, useState } from "react"
import { refreshMenuOptionsFromServer } from "./HomeTasksFunctions"
import * as _ from 'lodash'
import { isValidFilter } from "@/helpers/frontend/filters"
import { Form, Dropdown } from "react-bootstrap"
import { calDavObjectAtom, currentPageTitleAtom, filterAtom } from "stateStore/ViewStore"
import { useSetAtom } from "jotai"
import { TaskFilter } from "types/tasks/filters"
import { useTranslation } from "next-i18next"
import styles from "./HomeTasksDDL.module.css"
const defaultMenuOptions = PAGE_VIEW_JSON
interface FilterValueType extends TaskFilter{
    caldav_accounts_id?:string|number,
    calendars_id?:string|number
}
export const HomeTasksDDL = () => {
    /**
     * Jotai
     */
    const setCurrentPageTitle= useSetAtom(currentPageTitleAtom)
    const setFilterAtom = useSetAtom(filterAtom)
    const setCalDavAtom = useSetAtom(calDavObjectAtom)

    const [dropdownItems, setDropdownItems] = useState<JSX.Element[]>([])
    const [menuOptions, setMenuOptions] = useState<any | null>(defaultMenuOptions)
    const [selectedValue, setSelectedValue] = useState("MY_DAY")
    const { t } = useTranslation()
    useEffect(() => {
        let isMounted = true
        const refreshMenuOptions = async () => {
            const newMenuOptions = await refreshMenuOptionsFromServer(menuOptions,t)
            if (_.isEqual(menuOptions, newMenuOptions) == false) {
                setMenuOptions(newMenuOptions)

            }
        }
        if (isMounted) {
            refreshMenuOptions()

        }

        return () => {
            isMounted = false
        }
    }, [menuOptions])

    useEffect(() => {
        let isMounted = true

        if (isMounted) {
            const value = selectedValue
            console.log(value)
            let filterValue: FilterValueType = { logic: "or", filter: {} }
            if (varNotEmpty(value) && typeof (value == "string")) {
                var valueArray = value.split(',')
                if (Array.isArray(valueArray) && valueArray.length > 1) {

                    if (varNotEmpty(menuOptions[valueArray[0]]) && Array.isArray(menuOptions[valueArray[0]]) && menuOptions[valueArray[0]].length > 0) {
                        for (const k in menuOptions[valueArray[0]]) {
                            if (valueArray[1] in menuOptions[valueArray[0]][k]) {

                                filterValue = menuOptions[valueArray[0]][k][valueArray[1]]
                                if (isValidFilter(filterValue)) {
                                    console.log(filterValue)
                                    setFilterAtom(filterValue)
                                    setCurrentPageTitle(valueArray[0] + " >> " + t(valueArray[1]))
                                    setCalDavAtom({caldav_accounts_id: null, calendars_id: null})

                                } else {
                                    //Probably a calendar Object.
                                    if (("caldav_accounts_id" in filterValue) && ("calendars_id" in filterValue) && filterValue.calendars_id) {
                                        if(filterValue["caldav_accounts_id"] && filterValue["calendars_id"].toString()){

                                            setCurrentPageTitle("")
                                            setFilterAtom({})
                                    
                                            setCalDavAtom({caldav_accounts_id: parseInt(filterValue.caldav_accounts_id.toString()), calendars_id: parseInt(filterValue.calendars_id.toString())})
                                        }
                                    }
                                }

                                continue;
                            }
                        }

                    }


                } else {
                    filterValue = menuOptions[value]
                    setFilterAtom(filterValue)
                    setCurrentPageTitle(t(value).toString())
                    setCalDavAtom({caldav_accounts_id: null, calendars_id: null})
                }
            }

        }

        return () => {
            isMounted = false
        }

    }, [selectedValue, menuOptions])

    useEffect(()=>{
        let isMounted = true

        if(isMounted){
            let dropdownItems:any[] = []
            
            // Only include top-level options (time and priority filters)
            for(const key in menuOptions) {
                // Skip arrays which contain label filters
                if(varNotEmpty(menuOptions[key]) && !Array.isArray(menuOptions[key])) {
                    dropdownItems.push(
                        <Dropdown.Item 
                            key={"menu_view_"+key}
                            eventKey={key}
                            active={selectedValue === key}
                        >
                            {t(key)}
                        </Dropdown.Item>
                    )
                }
            }
            
            // Ensure we have at least the default options if nothing was found
            if (dropdownItems.length === 0) {
                const defaultOptions = ["MY_DAY", "DUE_TODAY", "DUE_THIS_WEEK", "HIGH_PRIORITY", "ALL_TASKS"];
                defaultOptions.forEach(option => {
                    dropdownItems.push(
                        <Dropdown.Item 
                            key={"menu_view_"+option}
                            eventKey={option}
                            active={selectedValue === option}
                        >
                            {t(option)}
                        </Dropdown.Item>
                    )
                });
            }
            
            // Log dropdown items for debugging
            console.log('Dropdown items:', dropdownItems.length)
            
            // Set the dropdown items
            setDropdownItems(dropdownItems)
        }
        
        return () => {
            isMounted = false
        }
    },[menuOptions, selectedValue])

    const menuOptionSelected = (value) => {
        setSelectedValue(value)
    }
    
    // Helper function to get the label for the selected value
    const getSelectedLabel = () => {
        // For top-level options
        if (menuOptions[selectedValue]) {
            return t(selectedValue)
        }
        
        return t("MY_DAY") // Default fallback
    }
    
    return (
        <div style={{marginTop: 20}}>
            <Dropdown onSelect={menuOptionSelected} className={`mb-3 ${styles.taskViewDropdown}`}>
                <Dropdown.Toggle variant="primary" id="task-view-dropdown">
                    {getSelectedLabel()}
                </Dropdown.Toggle>
                <Dropdown.Menu style={{maxHeight: '300px', overflowY: 'auto'}}>
                    {dropdownItems}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    )
}