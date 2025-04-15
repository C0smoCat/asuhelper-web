import {
    TabbarItem,
    Epic,
    Tabbar,
    Panel,
    View,
    PanelHeader,
    Group,
    Placeholder,
    AppRoot,
    AdaptivityProvider,
    ConfigProvider,
    SplitLayout,
    Cell,
    SplitCol,
    usePlatform,
    useAdaptivityConditionalRender,
    Banner,
    ButtonGroup,
    Button, Avatar, Footer, SimpleCell,
} from "@vkontakte/vkui";
import {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons/faUser";
import ErrorBoundary from "../ErrorBoundary";
import {
    createBrowserRouter,
    RouterProvider,
    useActiveVkuiLocation,
    useRouteNavigator
} from "@vkontakte/vk-mini-apps-router";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import ProfileView from "../../pages/ProfileView";
import {AuthInfo} from "../../types.ts";
import AuthView from "../../pages/AuthView";
import ScheduleView from "../../pages/ScheduleView";
import {faCalendarDays} from "@fortawesome/free-solid-svg-icons/faCalendarDays";
import FileWithAuth from "../FileWithAuth";
import {API_PATH} from "../../config.ts";
import PerformanceView from "../../pages/PerformanceView";
import {faChartLine} from "@fortawesome/free-solid-svg-icons/faChartLine";
import DocumentsView from "../../pages/DocumentsView";
import {faFileLines} from "@fortawesome/free-solid-svg-icons/faFileLines";
import api from "../../api.ts";
import {ScheduleContextProvider, useSchedule} from "../ScheduleProvider";
import {faCloudDownload} from "@fortawesome/free-solid-svg-icons/faCloudDownload";
import {formatDateWithTime} from "../../utils.tsx";

const pages: {
    path: string,
    dynamicPath?: ({authInfo}: { authInfo: AuthInfo | null }) => string | undefined | null,
    panelId?: string,
    icon?: IconDefinition,
    viewId: string,
    title?: string,
    view?: any,
}[] = [
    {
        path: "/schedule",
        dynamicPath: ({authInfo}) => authInfo?.user?.group_title ? `/schedule/groups/${authInfo.user.group_title}` : `/schedule`,
        viewId: "schedule_view",
        panelId: "index",
        icon: faCalendarDays,
        title: "Расписание",
        view: ScheduleView,
    },
    {
        path: "/schedule/groups/:groupTitle",
        viewId: "schedule_view",
        panelId: "group",
        title: "Расписание",
        view: ScheduleView,
    },
    {
        path: "/schedule/teachers/:teacherId",
        viewId: "schedule_view",
        panelId: "teacher",
        title: "Расписание",
        view: ScheduleView,
    },
    {
        path: "/schedule/classrooms/:classroomId",
        viewId: "schedule_view",
        panelId: "classroom",
        title: "Расписание",
        view: ScheduleView,
    },
    {
        path: "/schedule/disciplines/:disciplineId",
        viewId: "schedule_view",
        panelId: "discipline",
        title: "Расписание",
        view: ScheduleView,
    },
    {
        path: "/performance",
        dynamicPath: ({authInfo}) => authInfo?.user?.group_title ? `/performance` : `/login`,
        viewId: "performance_view",
        icon: faChartLine,
        title: "Оценки",
        view: PerformanceView,
    },
    {
        path: "/documents",
        dynamicPath: ({authInfo}) => authInfo?.user?.group_title ? `/documents` : `/login`,
        viewId: "documents_view",
        panelId: "index",
        icon: faFileLines,
        title: "Единый деканат",
        view: DocumentsView,
    },
    {
        path: "/documents/:documentId",
        dynamicPath: ({authInfo}) => authInfo?.user?.group_title ? `/documents` : `/login`,
        viewId: "documents_view",
        panelId: "request_panel",
        title: "Единый деканат",
        view: DocumentsView,
    },
    // {
    //     path: "/messages",
    //     dynamicPath: ({authInfo}) => authInfo?.user?.group_title ? `/messages` : `/login`,
    //     viewId: "messages_view",
    //     panelId: "index",
    //     icon: faComments,
    //     title: "Сообщения",
    //     view: DocumentsView,
    // },
    {
        path: "/profile",
        dynamicPath: ({authInfo}) => authInfo?.user?.group_title ? `/profile` : `/login`,
        viewId: "profile_view",
        icon: faUser,
        title: "Профиль",
        view: ProfileView,
    },
    {
        path: "/login",
        panelId: "login",
        viewId: "auth_view",
        view: AuthView,
    },
];

const router = createBrowserRouter(
    pages.map(p => ({
        path: p.path,
        panel: p.panelId || "index",
        view: p.viewId,
    }))
);

function MyApp() {
    return (
        <ConfigProvider>
            <AdaptivityProvider>
                <AppRoot>
                    <ErrorBoundary>
                        <ScheduleContextProvider>
                            <RouterProvider router={router} notFoundRedirectPath={pages[0].path}>
                                <MyEpic/>
                            </RouterProvider>
                        </ScheduleContextProvider>
                    </ErrorBoundary>
                </AppRoot>
            </AdaptivityProvider>
        </ConfigProvider>
    );
}

function MyEpic() {
    const routeNavigator = useRouteNavigator();
    const {view: activeView} = useActiveVkuiLocation();
    const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);

    const platform = usePlatform();
    const {viewWidth} = useAdaptivityConditionalRender();
    const hasHeader = platform !== 'vkcom';

    const filteredPages = pages.filter(pg => !!pg.title && !!pg.icon);

    // const isAndroid = /(android)/i.test(navigator?.userAgent || "");

    useEffect(() => {
        const savedUser = localStorage && localStorage.getItem('user') || null;
        if (savedUser) {
            const authInfo: (AuthInfo & { ts: number }) = JSON.parse(savedUser);
            if (Date.now() - authInfo.ts < 30 * 24 * 60 * 60 * 1000) {
                setAuthInfo(authInfo);
                api.setApiToken(authInfo.token.token);
            } else {
                setAuthInfo(null);
                api.setApiToken(null);
            }
        }
    }, []);

    return (
        <SplitLayout header={hasHeader && <PanelHeader delimiter="none"/>} center>
            {viewWidth.tabletPlus && (
                <SplitCol className={viewWidth.tabletPlus.className} fixed width={280} maxWidth={280}>
                    <Panel>
                        {hasHeader && <PanelHeader/>}
                        <Group>
                            {authInfo?.user && (
                                <Group
                                    mode="plain"
                                    onClick={() => routeNavigator.push("/profile")}
                                    style={{cursor: "pointer"}}
                                >
                                    <Placeholder
                                        style={{padding: "2em"}}
                                        icon={
                                            <FileWithAuth
                                                src={authInfo.user.avatar_id ? `${API_PATH}files2/${authInfo.user.avatar_id}` : null}
                                                callback={(avatarObjectURL) => (
                                                    <Avatar
                                                        src={avatarObjectURL || undefined}
                                                        initials={`${authInfo.user.first_name[0]}${authInfo.user.last_name[0]}`}
                                                        gradientColor={authInfo.user.id % 6 + 1 as (1 | 2 | 3 | 4 | 5 | 6)}
                                                        size={96}
                                                    />
                                                )}
                                            />
                                        }
                                        title={`${authInfo.user.first_name} ${authInfo.user.last_name}`}
                                    />
                                </Group>
                            )}
                            <Group mode="plain">
                                {filteredPages.map(pg => (
                                    <Cell
                                        key={pg.path}
                                        title={pg.title}
                                        selected={activeView === pg.viewId}
                                        // disabled={activeStory === 'feed'}
                                        // style={activeView === pg.viewId ? activeStoryStyles : undefined}
                                        onClick={() => routeNavigator.push((pg.dynamicPath && pg.dynamicPath({authInfo})) || pg.path)}
                                        before={<FontAwesomeIcon icon={pg.icon!} fixedWidth/>}
                                    >
                                        {pg.title}
                                    </Cell>
                                ))}
                            </Group>
                        </Group>
                        <ScheduleStatus/>
                        {SHOW_NATIVE_APP_PROMO && window?.open && (
                            <Banner
                                title="В приложении ещё удобнее!"
                                subtitle="«Помощник студента АГУ» — мобильное приложение, разработанное специально для студентов Астраханского государственного университета им. В. Н. Татищева"
                                style={{
                                    backgroundColor: 'var(--vkui--color_background_content)',
                                }}
                                actions={
                                    <ButtonGroup mode="vertical" gap="m">
                                        <Button
                                            mode="primary"
                                            onClick={() => window.open("https://play.google.com/store/apps/details?id=ru.reaperoq.asuhelper", '_blank')}
                                        >
                                            Google Play
                                        </Button>
                                        <Button
                                            mode="link"
                                            onClick={() => window.open("https://apps.rustore.ru/app/ru.reaperoq.asuhelper", '_blank')}
                                        >
                                            Rustore
                                        </Button>
                                        <Button
                                            mode="link"
                                            onClick={() => window.open("https://webstudent.asu-edu.ru/download", '_blank')}
                                        >
                                            Скачать APK
                                        </Button>
                                    </ButtonGroup>
                                }
                            />
                        )}
                        <Footer>
                            Сборка {
                            //@ts-ignore
                            import.meta.env.PROD ? BUILD_TIME : "DEV"
                        }
                        </Footer>
                    </Panel>
                </SplitCol>
            )}

            <SplitCol width="100%" maxWidth="560px" stretchedOnMobile autoSpaced>
                <Epic
                    activeStory={activeView || "profile"}
                    tabbar={
                        viewWidth.tabletMinus && filteredPages.length > 1 && (
                            <Tabbar className={viewWidth.tabletMinus.className}>
                                {filteredPages.map(pg => (
                                    <TabbarItem
                                        key={pg.path}
                                        onClick={() => routeNavigator.push((pg.dynamicPath && pg.dynamicPath({authInfo})) || pg.path)}
                                        selected={activeView === pg.viewId}
                                        label={pg.title}
                                    >
                                        <FontAwesomeIcon icon={pg.icon!} fixedWidth/>
                                    </TabbarItem>
                                ))}
                            </Tabbar>
                        )
                    }
                >
                    {pages.map(pg => {
                        if (pg.view) {
                            const CustomView = pg.view;
                            return (
                                <CustomView
                                    key={pg.path}
                                    authInfo={authInfo}
                                    setAuthInfo={setAuthInfo}
                                    viewId={pg.viewId}
                                    id={pg.viewId}
                                />
                            );
                        }

                        return (
                            <View id={pg.viewId} activePanel="index" key={pg.path}>
                                <Panel id="index">
                                    <PanelHeader>{pg.title}</PanelHeader>
                                    <Group style={{height: '500px'}}>
                                        <Placeholder icon={
                                            pg.icon && (
                                                <FontAwesomeIcon icon={pg.icon} size="5x" fixedWidth/>
                                            )
                                        }>
                                            {pg.title}
                                        </Placeholder>
                                    </Group>
                                </Panel>
                            </View>
                        );
                    })}
                </Epic>
            </SplitCol>
        </SplitLayout>
    );
}

export function saveUserConfig(userAndToken: AuthInfo | null) {
    if (!localStorage) {
        return;
    }

    if (userAndToken) {
        localStorage.setItem('user', JSON.stringify({
            ...userAndToken,
            ts: Date.now()
        }));
    } else {
        localStorage.removeItem("user");
    }
}

export function ScheduleStatus({className}: { className?: string }) {
    const scheduleStore = useSchedule();

    return !!scheduleStore && (
        <Group className={className}>
            <SimpleCell
                before={<FontAwesomeIcon icon={faCloudDownload} fixedWidth/>}
                subtitle={
                    scheduleStore.localSchedule?.schedule?.meta ? (
                        `Скачано: ${formatDateWithTime(scheduleStore.localSchedule?.schedule?.meta.update_time * 1000)}`
                    ) : (
                        `Локальное расписание недоступно`
                    )
                }
                multiline
            >
                {scheduleStore.scheduleType === "online" ? (
                    "Используется онлайн-расписание"
                ) : (
                    "Используется локальное расписание"
                )}
            </SimpleCell>
        </Group>
    );
}

export default MyApp;
