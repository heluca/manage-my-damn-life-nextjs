import { ViewMode } from "gantt-task-react"
import { useTranslation } from "next-i18next"
import { useState } from "react"
import { Col, Form, Row } from "react-bootstrap"

export const GanttFilters = ({onViewChanged, onShowChildrenChanged, onShowTaskWithoutDueChanged}:{onViewChanged: Function, onShowChildrenChanged: Function, onShowTaskWithoutDueChanged: Function}) =>{

    const [showChildren, setShowChildren] = useState(true)
    const [showWithoutDue, setShowWithoutDue] = useState(false)
    const [view, setView] = useState(ViewMode.Week)
    const {t} = useTranslation()
    const viewChanged = (e) =>{
        setView(e.target.value)
        onViewChanged(e.target.value)
    }
    const childrenVisiblityChanged = (e) =>{
        setShowChildren(e.target.checked)
        onShowChildrenChanged(e.target.checked)
    }
    const showTaskWithoutDueChanged = (e) =>{
        setShowWithoutDue(e.target.checked)
        onShowTaskWithoutDueChanged(e.target.checked)
    }
    return(
        <Row>
            <Col md={4}>
                <Form.Group className="mb-0">
                    <Form.Label>{t("VIEW")}</Form.Label>
                    <Form.Select 
                        value={view} 
                        onChange={viewChanged} 
                        className="mb-0 form-select-primary"
                        style={{ backgroundColor: 'var(--bs-primary)', color: 'var(--bs-primary-bg-subtle)' }}
                    >
                        <option value={ViewMode.Day}>{t("DAY_VIEW")}</option>
                        <option value={ViewMode.Week}>{t("WEEK_VIEW")}</option>
                        <option value={ViewMode.Month}>{t("MONTH_VIEW")}</option>
                    </Form.Select>
                    <small className="text-muted">Column width adjusts by view</small>
                </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
                <Form.Check
                    type="switch"
                    key="switch_OK"
                    id="children_visible_switch"
                    checked={showChildren}
                    onChange={childrenVisiblityChanged}
                    label={t("SHOW_CHILDREN")}
                    className="mb-0"
                />
            </Col>
            <Col md={4} className="d-flex align-items-end">
                <Form.Check
                    type="switch"
                    checked={showWithoutDue}
                    onChange={showTaskWithoutDueChanged}
                    label={t("SHOW_TASKS_WITH_NO_DUE")}
                    className="mb-0"
                />
            </Col>
        </Row>
    )
}