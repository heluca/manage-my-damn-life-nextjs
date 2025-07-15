import FilterList from "@/components/filters/FilterList"
import { SYSTEM_DEFAULT_LABEL_PREFIX } from "@/config/constants"
import { PRIMARY_COLOUR } from "@/config/style"
import { getAllLabelsFromDexie, updateLabelCacheInDexie } from "@/helpers/frontend/dexie/dexie_labels"
import { isDarkModeEnabled } from "@/helpers/frontend/theme"
import { PAGE_VIEW_JSON } from "@/helpers/viewHelpers/pages"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Badge, Col, Form, Row } from "react-bootstrap"
import { AiOutlineFilter, AiOutlineSetting } from "react-icons/ai"
import { IoRefreshCircleOutline } from "react-icons/io5"
import { FaExternalLinkAlt } from "react-icons/fa";
import { FilterSelector } from "./FilterSelector"
import { toast } from "react-toastify"
import { useAtomValue, useSetAtom } from 'jotai'
import { calDavObjectAtom, currentPageAtom, currentPageTitleAtom, filterAtom } from "stateStore/ViewStore"
import { FilterListWithStateManagement } from "@/components/filters/FilterListWithStateManagement"
import { BsCalendar3 } from "react-icons/bs"
import { ShowCalendarListWithStateManagement } from "../calendars/ShowCalendarListWithStateManagement"
import { useTranslation } from "next-i18next"
export const GenericListsWithStateManagement = ({postClick}: {postClick: Function}) =>{
    /**
     * Jotai
     */
    const setCurrentPageTitle= useSetAtom(currentPageTitleAtom)
    const setFilterAtom = useSetAtom(filterAtom)
    const setCalDavAtom = useSetAtom(calDavObjectAtom)
    /**
     * Local State
     */
    const [totalHeight, setTotalHeight] = useState(0)
    const [allFilters, setAllFilters] = useState<JSX.Element[]>([])
    const [filterViewType, setFilterViewType] = useState<'dropdown' | 'radio'>('dropdown')

    const{t} = useTranslation()
    const updateDimensions = () => {
        setTotalHeight(window.innerHeight-100);
    };

    const labelClicked = useCallback((e) =>{
        const labelName = e.target.textContent
        const currentFilter = {label: [labelName]}
        const title = `${t("LABEL")}: ${labelName}`
        setCurrentPageTitle(title)
        setFilterAtom({logic: "or", filter: currentFilter})
        setCalDavAtom({caldav_accounts_id: null, calendars_id: null})
        postClick()
    },[postClick, setFilterAtom, setCurrentPageTitle, setCalDavAtom])
    const generateLabelListfromDexie = useCallback(async () =>{
        const labels = await getAllLabelsFromDexie()
        let temp_Labelcomponent: JSX.Element[] =[]
        if(labels!=null)
        {
            for (const key in labels)
            {      
                //temp_Labelcomponent.push((<><Button size="sm" value={labels[key].name} onClick={this.props.labelClicked} style={{margin: 5, backgroundColor: labels[key].colour, color: 'white'}} >{labels[key].name}</Button>{' '}</>))
                var border="1px solid "+labels[key].colour
                if(!labels[key]?.name?.startsWith(SYSTEM_DEFAULT_LABEL_PREFIX+"-") && labels[key].name)
                {
                    temp_Labelcomponent.push(<Badge className="textDefault" key={labels[key].name} onClick={labelClicked} bg="light" pill style={{margin: 5, borderColor:"pink", border:border, color: labels[key].colour,  textDecorationColor : 'white'}} >{labels[key].name}&nbsp;<Link target="_blank" href={`?type=LABEL&&label_name=${labels[key].name}`}><FaExternalLinkAlt className="textDefault" /> </Link></Badge>)

                }
            }

            if(temp_Labelcomponent.length==0){
                setAllFilters([<>{t("NO_LABELS_TO_SHOW")}</>])
            }else{

                setAllFilters(temp_Labelcomponent)
            }

        }
    },[labelClicked])

    useEffect(() => {
        let isMounted = true
        if(isMounted)
        {
            generateLabelListfromDexie()
        }
        if(window!=undefined)
        {
            setTotalHeight(window.innerHeight-100);

            window.addEventListener('resize', updateDimensions);

        }

        return ()=>{
            isMounted = false
        }
    }, [generateLabelListfromDexie])

    
    const updateLabelCache = () =>{
        toast.info(t("UPDATING_LABEL_CACHE"))
        updateLabelCacheInDexie().then(()=>{
            generateLabelListfromDexie()
        })
    }

    const darkMode= isDarkModeEnabled() 
    const borderBottomColor = darkMode ? "white" : "black"
    const settingButtonColor = darkMode ? "white" : PRIMARY_COLOUR

    return(
        <>
            <div style={{overflowY: 'scroll',  height: totalHeight}}>
                <div style={{margin: 20, padding: 5}}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h3>{t("QUICK_FILTERS")}</h3>
                        <Form.Check 
                            type="switch"
                            id="filter-view-switch"
                            label={t("SHOW_AS_LIST")}
                            onChange={(e) => setFilterViewType(e.target.checked ? 'radio' : 'dropdown')}
                        />
                    </div>
                    <FilterSelector postClick={postClick} variant={filterViewType} />
                </div>
                <br />

                <div style={{margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', }} className="row">
                    <Col><h3><AiOutlineFilter />{t("FILTERS")}</h3></Col>
                    <Col style={{textAlign:"right"}}><Link href="/filters/manage"> <AiOutlineSetting color={settingButtonColor} /></Link></Col>
                </div>
                <Row style={{borderBottom: `1px solid ${borderBottomColor}`, margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', }} >
                    <Col><FilterListWithStateManagement postClick={postClick}  /></Col>
                </Row>
                <Row style={{marginLeft: 20, marginRight: 20, padding: 5, justifyContent: 'center', alignItems:'center', display: "flex" }} >
                    <Col><h3>{t("BY_LABELS")}</h3></Col>
                    <Col> <h3 style={{textAlign: "right"}}><IoRefreshCircleOutline onClick={updateLabelCache} color={settingButtonColor} />&nbsp;&nbsp;<Link href="/labels/manage"><AiOutlineSetting  color={settingButtonColor}/></Link></h3></Col>
                </Row>
                <div style={{marginLeft: 20, marginRight: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}}  className="row">
                        <div className="col-12">
                            {allFilters}
                        </div>
                </div>
                <div style={{marginTop: 40, marginLeft: 20, marginRight: 20, padding: 5, justifyContent: 'center', alignItems:'center', }} className="row">
                        <Col>
                        <h3><BsCalendar3 />&nbsp;{t("CALENDARS")}</h3>
                        </Col>
                        <Col style={{textAlign:"right"}}><Link href="/accounts/caldav"><AiOutlineSetting color={settingButtonColor} /></Link> </Col>

                    </div>
                    <Row style={{ marginTop: 10, marginLeft: 20, marginRight: 20, padding: 5, justifyContent: 'center', alignItems:'center', }}>
                        <ShowCalendarListWithStateManagement postClick={postClick}  />
                    </Row>

            </div>

        </>
    )
}