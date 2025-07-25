
import { useRouter } from "next/router";
import { Button, Container, Form, NavItem, NavLink, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { SETTING_NAME_CUSTOM_LOGO, SETTING_NAME_NAVBAR_LINKS } from "@/helpers/frontend/settings";
import React, { useEffect, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { AiOutlineSetting, AiOutlineUser } from "react-icons/ai";
import { IoSyncCircleOutline } from "react-icons/io5/index";
import { BiLogOut } from "react-icons/bi";
import Link from "next/link";
import Dropdown from 'react-bootstrap/Dropdown';
import Image from "next/image";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { isDarkModeEnabled, setThemeMode } from "@/helpers/frontend/theme";
import { installCheck_Cookie } from "@/helpers/install";
import { fetchLatestEventsV2, isSyncing } from "@/helpers/frontend/sync";
import { logoutUser, logoutUser_withRedirect } from "@/helpers/frontend/user";
import { getUserNameFromCookie } from "@/helpers/frontend/cookies";
import { updateCalendarViewAtom, updateViewAtom } from "stateStore/ViewStore";
import { useSetAtom } from "jotai";
import { AVAILABLE_LANGUAGES } from "@/config/constants";
import { appendLanguageToURL, getCurrentLanguage, getDefaultLanguage, setCurrentLanguage } from "@/helpers/frontend/translations";
import { GetStaticProps } from "next";
import { Props } from "next/script";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from "next-i18next";
import {  signOut } from "next-auth/react"
import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
// import i18n from "@/i18n/i18n";
const AppBarFunctionalComponent = ({ session}) => {
  /**
   * Jotai
   */

  const setUpdated = useSetAtom(updateViewAtom)
  const setUpdatedCalendarView = useSetAtom(updateCalendarViewAtom)
  /**
   * Local State
   */
  const [username, setUsername] = useState("");
  const [installed, setInstalled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [lang, setLang] = useState(getCurrentLanguage())
  const [logoUrl, setLogoUrl] = useState("/logo.png")
  const [customLinks, setCustomLinks] = useState<Array<{name: string, url: string, enabled: boolean}>>([])
  const {t, i18n} = useTranslation()

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    if(isMounted){
      checkInstallation();
      setDarkModeEnabled(isDarkModeEnabled());
      
      // Load custom logo if available
      const customLogo = localStorage.getItem(SETTING_NAME_CUSTOM_LOGO);
      if (customLogo && customLogo.trim() !== '') {
        setLogoUrl(customLogo);
      }
      
      // Load custom navbar links if available
      const navbarLinksStr = localStorage.getItem(SETTING_NAME_NAVBAR_LINKS);
      if (navbarLinksStr) {
        try {
          const links = JSON.parse(navbarLinksStr);
          setCustomLinks(links);
        } catch (error) {
          console.error('Error parsing navbar links:', error);
        }
      }
      
      // Listen for logo updates
      const handleLogoUpdate = (event) => {
        if (event.detail && event.detail.logoUrl && event.detail.logoUrl.trim() !== '') {
          setLogoUrl(event.detail.logoUrl);
        } else {
          setLogoUrl('/logo.png');
        }
      };
      
      // Listen for navbar links updates
      const handleNavbarLinksUpdate = (event) => {
        if (event.detail && event.detail.links) {
          setCustomLinks(event.detail.links);
        }
      };
      
      window.addEventListener('logoUpdated', handleLogoUpdate);
      window.addEventListener('navbarLinksUpdated', handleNavbarLinksUpdate);
      
      return () => {
        isMounted = false;
        window.removeEventListener('logoUpdated', handleLogoUpdate);
        window.removeEventListener('navbarLinksUpdated', handleNavbarLinksUpdate);
      };
    }
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(()=>{
    let isMounted =true
    if(isMounted){
      setUsernameFromSession();
    }
    return ()=>{
      isMounted=false
  }

  },[session])

  const setUsernameFromSession = async () => {
    try {
      if (session && session.data) {
        const { data: sessionData, status } = session;
        if (status !== "loading") {
          setUsername(sessionData.user.name);
        }
      }else{
        setUsername(getUserNameFromCookie())
      }
    } catch (error) {
      console.warn("Error setting username from session:", error);
    }
  };

  const checkInstallation = async () => {
    try {
      const isInstalled = await installCheck_Cookie(router);
      console.log("isInstalled" ,isInstalled)
      setInstalled(isInstalled);
      
    } catch (error) {
      console.error("Error checking installation:", error);
    }
  };

  const syncButtonClicked = async () => {
      await fetchLatestEventsV2()
      setUpdated(Date.now())
      setUpdatedCalendarView(Date.now())
   
  };

  const logoClicked = () => {
    router.push("/");
  };

  const taskViewClicked = () => {
    router.push("/tasks/list");
  };

  const logOutClicked = async () => {
    if(await nextAuthEnabled()){
      logoutUser()
      signOut()
      router.push('/api/auth/signin')
    }else{
      logoutUser_withRedirect(router);
    }
    
  };

  const settingsClicked = () => {
    router.push("/accounts/settings");
  };

  const manageFilterClicked = () => {
    router.push("/filters/manage");
  };

  const labelManageClicked = () => {
    router.push("/labels/manage");
  };

  const manageCaldavClicked = () => {
    router.push("/accounts/caldav");
  };

  const flipThemeMode = () => {
    const newMode = isDarkModeEnabled() ? "light" : "dark";
    setThemeMode(newMode);
    setDarkModeEnabled(isDarkModeEnabled());
  };

  const spinningButton = isSyncing();
  const syncButton = spinningButton ? (
    <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
  ) : (
    <IoSyncCircleOutline size={24} onClick={syncButtonClicked} />
  );

  const darkModeButton = darkModeEnabled ? (
    <MdOutlineDarkMode onClick={flipThemeMode} size={24} />
  ) : (
    <MdOutlineLightMode onClick={flipThemeMode} size={24} />
  );

  const notInstalledBannerClicked = () =>{
    router.push("/install")
  }
  const langChanged = (e) =>{
    setCurrentLanguage(e.target.value)
    setLang(e.target.value)
    if(typeof(window)!="undefined"){
      window.location.reload()
    }

    // i18n.changeLanguage(e.target.value)
  }

  let notInstalledBanner: JSX.Element | null = null;
  if (!installed) {
    notInstalledBanner = (
      <div onClick={notInstalledBannerClicked} style={{ background: "darkred", textAlign: "center", color: "white" }}>{t("MMDL_NOT_INSTALLED")}</div>
    );
  }

  let langOption:JSX.Element[] = []
  for(const i in AVAILABLE_LANGUAGES){
    langOption.push(      <option value={AVAILABLE_LANGUAGES[i]}>{AVAILABLE_LANGUAGES[i]}</option>)
  }
  return (
    <>
      {notInstalledBanner}
      <Navbar bg="primary" variant="dark" className="nav-pills nav-fill" style={{ padding: 20 }} sticky="top" expand="lg">
        <Navbar.Brand onClick={logoClicked}>
          <Image
            src={logoUrl}
            width="30"
            height="30"
            className="d-inline-block align-top"
            alt="Manage my Damn Life"
            onError={() => setLogoUrl("/logo.png")} // Fallback to default logo if custom one fails to load
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse className="justify-content-end" id="basic-navbar-nav">
          <Nav style={{ display: "flex", margin: 5, justifyContent: "space-evenly", alignItems: "center"  }} >
            <Link style={{ color: "white", textDecoration: "none" }} href="/">{t("HOME")}</Link> &nbsp; &nbsp;
            <Link style={{ color: "white", textDecoration: "none" }} href="/calendar/view">{t("CALENDAR")}</Link>&nbsp; &nbsp;
            <Link style={{ color: "white", textDecoration: "none" }} href="/tasks/list">{t("TASKS")}</Link>
            {customLinks.map((link, index) => (
              link.enabled && link.name && link.url ? (
                <React.Fragment key={`custom-link-${index}`}>
                  &nbsp; &nbsp;
                  <a 
                    style={{ color: "white", textDecoration: "none" }} 
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.name}
                  </a>
                </React.Fragment>
              ) : null
            ))}
            <Nav.Item>
              <Dropdown style={{ color: "white" }} as={NavItem}>
                <Dropdown.Toggle style={{ color: "white" }} as={NavLink}>
                  <AiOutlineSetting size={24} />
                </Dropdown.Toggle>
                <Dropdown.Menu id="DDL_MENU_SETTINGS">
                  <Dropdown.Item onClick={labelManageClicked}>{t("LABEL_MANAGER")}</Dropdown.Item>
                  <Dropdown.Item onClick={manageFilterClicked}>{t("MANAGE_FILTERS")}</Dropdown.Item>
                  <Dropdown.Item onClick={manageCaldavClicked}>{t("MANAGE") + " " + t("CALDAV_ACCOUNTS")}</Dropdown.Item>
                  <Dropdown.Item onClick={() =>{router.push('/templates/manage/')}}>{t("TEMPLATE_MANAGER")}</Dropdown.Item>
                  <Dropdown.Item onClick={settingsClicked}>{t("SETTINGS")}</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav.Item>
          </Nav>
            <Nav  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} className="ms-auto">
              <NavItem style={{ color: "white", display: "flex", margin: 10, justifyContent: "space-evenly", alignItems: "center" }}>
                <OverlayTrigger key="KEY_USERNAME" placement='bottom'
                  overlay={
                    <Tooltip id='tooltip_USERNAME'>
                      {t("USERNAME")}
                    </Tooltip>
                  }>
                  <div>
                    <AiOutlineUser />
                    {username}
                  </div>
                </OverlayTrigger>
              </NavItem>
              <Nav.Item style={{}}>
              <Form.Select onChange={langChanged} value={lang} aria-label="Default select example">
                {langOption}
              </Form.Select>              
                </Nav.Item>
              <Nav.Item style={{}}>
                <OverlayTrigger key="DARK_MODE_KEY" placement='bottom'
                  overlay={
                    <Tooltip id='tooltip_DARK_MODE_KEY'>
                      {t("THEME_MODE")}
                    </Tooltip>
                  }>
                  <div style={{ color: "white", padding: 5 }}>{darkModeButton} </div>
                </OverlayTrigger>
              </Nav.Item>
              <Nav.Item style={{}}>
                <OverlayTrigger key="SYNC_KEY" placement='bottom'
                  overlay={
                    <Tooltip id='tooltip_SYNC'>
                      {t("SYNC")}
                    </Tooltip>
                  }>
                  <div style={{ color: "white", padding: 5 }}>{syncButton} </div>
                </OverlayTrigger>
              </Nav.Item>
              <Nav.Item style={{ color: "white", padding: 5 }}>
                <BiLogOut onClick={logOutClicked} size={24} />
              </Nav.Item>
            </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};


export default AppBarFunctionalComponent;
