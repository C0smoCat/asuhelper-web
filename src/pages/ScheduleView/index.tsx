import {
    Button,
    Calendar,
    Div,
    Footer,
    FormItem,
    FormStatus,
    Group,
    Header,
    IconButton,
    Link,
    ModalCard,
    ModalPage,
    Panel,
    PanelHeader,
    Paragraph,
    Placeholder,
    SegmentedControl,
    SelectMimicry,
    SimpleCell,
    Spacing,
    View,
} from "@vkontakte/vkui";
import {AuthInfo} from "../../types.ts";
import {useGetPanelForView, useParams, useRouteNavigator} from "@vkontakte/vk-mini-apps-router";
import {Dispatch, ReactNode, useEffect, useState} from "react";
import {
    addDays,
    formatDateWithTime,
    getWeekDayNum,
    getWeekNumber,
    reactJoin,
    weekdayString
} from "../../utils.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner} from "@fortawesome/free-solid-svg-icons/faSpinner";
import useApiRequest from "../../utils/useApiRequest.ts";
import {faMugHot} from "@fortawesome/free-solid-svg-icons/faMugHot";
import {faBolt} from "@fortawesome/free-solid-svg-icons/faBolt";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons/faChevronRight";
import {faChevronLeft} from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import {useSchedule} from "../../components/ScheduleProvider";
import {ApiResponse} from "../../api.ts";

export type ScheduleType = "groups" | "teachers" | "classrooms" | "disciplines";

function Index({viewId, authInfo}: { viewId: string, authInfo: AuthInfo }) {
    const activePanel = useGetPanelForView('schedule_view');

    return (
        <View activePanel={activePanel!} key={viewId}>
            <SchedulePanel id="index" authInfo={authInfo}/>
            <GroupSchedulePanel id="group"/>
            <ScheduleTeacherPanel id="teacher"/>
            <ScheduleClassroomPanel id="classroom"/>
            <ScheduleDisciplinePanel id="discipline"/>
        </View>
    );
}

function SchedulePanelDateSelector({setDate, date}: { setDate: Dispatch<Date>, date: Date }) {
    const [calendarOpen, setCalendarOpen] = useState(false);

    return (
        <FormItem style={{display: "flex"}}>
            <IconButton label="Вчера" style={{padding: "1em"}} onClick={() => setDate(addDays(date, -1))}>
                <FontAwesomeIcon icon={faChevronLeft} fixedWidth/>
            </IconButton>
            <SelectMimicry placeholder="Не выбрана" onClick={() => setCalendarOpen(true)}>
                {date.toLocaleDateString()} ({weekdayString(date)})
            </SelectMimicry>
            <ModalCard open={calendarOpen} onClose={() => setCalendarOpen(false)}>
                <Calendar
                    value={date}
                    onChange={newDate => setDate(newDate as Date)}
                    showNeighboringMonth
                    style={{
                        boxShadow: "none",
                        border: "none",
                        width: "100%",
                        minHeight: "40vh"
                    }}
                />
                <div style={{
                    height: "var(--vkui_internal--tabbar_height)"
                }}/>
            </ModalCard>
            <IconButton label="Завтра" style={{padding: "1em"}} onClick={() => setDate(addDays(date, 1))}>
                <FontAwesomeIcon icon={faChevronRight} fixedWidth/>
            </IconButton>
        </FormItem>
    );
}

function GroupSchedulePanel({id}: { id: string }) {
    const [subgroupNum, setSubgroupNum] = useState(1);
    const [date, setDate] = useState(new Date());

    // @ts-ignore
    const {groupTitle: groupTitle} = useParams<"groupTitle">();

    const {
        isLoading,
        ok,
        message: apiError,
        response: schedule,
    } = useApiRequest(`schedule/groups/${groupTitle}`, undefined, res => {
        res.data.showSubgroups = res.data.schedule && res.data.schedule.some((week: any) => (
            week && week.some((day: any) => (
                day && day.some((les: any) => (
                    les && les.some((l: any) => l.subgroups !== 0)
                ))
            ))
        ));
        return res.data;
    });

    return (
        <Panel id={id}>
            <PanelHeader>Расписание</PanelHeader>
            <Group>
                <ScheduleSelectorButton
                    text={`Группа ${groupTitle}`}
                />
                {isLoading ? (
                    <Placeholder
                        icon={<FontAwesomeIcon icon={faSpinner} size="2x" fixedWidth spin/>}
                        title="Загрузка..."
                    />
                ) : !ok ? (
                    <FormItem>
                        <FormStatus mode="error" title="Ошибка">
                            <p>{apiError}</p>
                        </FormStatus>
                    </FormItem>
                ) : (!Array.isArray(schedule.schedule) || schedule.schedule.length <= 0) ? (
                    <Placeholder
                        title="Нет расписания :("
                    />
                ) : (<>
                    <SchedulePanelDateSelector
                        date={date}
                        setDate={setDate}
                    />
                    {schedule.showSubgroups && (
                        <FormItem>
                            <SegmentedControl
                                options={[
                                    {'label': "Подгруппа 1", 'value': 1, 'aria-label': 'Подгруппа 1',},
                                    {'label': "Подгруппа 2", 'value': 2, 'aria-label': 'Подгруппа 2',},
                                ]}
                                value={subgroupNum}
                                onChange={(newValue) => setSubgroupNum(newValue as number)}
                            />
                        </FormItem>
                    )}
                    <ScheduleDay
                        daySchedule={getScheduleByDate(schedule.schedule, date)}
                        subgroup={schedule.showSubgroups ? subgroupNum : 0}
                        showTeacher={true}
                        showClassroom={true}
                        showGroup={false}
                    />
                    <Footer>
                        Обновлено {formatDateWithTime(new Date(schedule.meta.update_time * 1000))}<br/>
                        В расписании не учитываются замены и переносы
                    </Footer>
                </>)}
            </Group>
        </Panel>
    );
}

function ScheduleTeacherPanel({id}: { id: string }) {
    const [date, setDate] = useState(new Date());

    // @ts-ignore
    const {teacherId} = useParams<"teacherId">();

    const {
        isLoading,
        ok,
        message: apiError,
        response: schedule,
    } = useApiRequest(`schedule/teachers/${teacherId}`, undefined, res => res.data);

    return (
        <Panel id={id}>
            <PanelHeader>Расписание</PanelHeader>
            <Group>
                <ScheduleSelectorButton
                    text={`Преподаватель id${teacherId}`}
                />
                {isLoading ? (
                    <Placeholder
                        icon={<FontAwesomeIcon icon={faSpinner} size="2x" fixedWidth spin/>}
                        title="Загрузка..."
                    />
                ) : !ok ? (
                    <FormItem>
                        <FormStatus mode="error" title="Ошибка">
                            <p>{apiError}</p>
                        </FormStatus>
                    </FormItem>
                ) : (!Array.isArray(schedule.schedule) || schedule.schedule.length <= 0) ? (
                    <Placeholder
                        title="Нет расписания :("
                    />
                ) : (<>
                    <SchedulePanelDateSelector
                        date={date}
                        setDate={setDate}
                    />
                    <ScheduleDay
                        daySchedule={getScheduleByDate(schedule.schedule, date)}
                        subgroup={null}
                        showTeacher={false}
                        showClassroom={true}
                        showGroup={true}
                    />
                    <Footer>
                        Обновлено {formatDateWithTime(new Date(schedule.meta.update_time * 1000))}<br/>
                        В расписании не учитываются замены и переносы
                    </Footer>
                </>)}
            </Group>
        </Panel>
    );
}

function ScheduleClassroomPanel({id}: { id: string }) {
    const [date, setDate] = useState(new Date());

    // @ts-ignore
    const {classroomId} = useParams<"classroomId">();

    const {
        isLoading,
        ok,
        message: apiError,
        response: schedule,
    } = useApiRequest(`schedule/classrooms/${classroomId}`, undefined, res => res.data);

    return (
        <Panel id={id}>
            <PanelHeader>Расписание</PanelHeader>
            <Group>
                <ScheduleSelectorButton
                    text={`Аудитория id${classroomId}`}
                />
                {isLoading ? (
                    <Placeholder
                        icon={<FontAwesomeIcon icon={faSpinner} size="2x" fixedWidth spin/>}
                        title="Загрузка..."
                    />
                ) : !ok ? (
                    <FormItem>
                        <FormStatus mode="error" title="Ошибка">
                            <p>{apiError}</p>
                        </FormStatus>
                    </FormItem>
                ) : (!Array.isArray(schedule.schedule) || schedule.schedule.length <= 0) ? (
                    <Placeholder
                        title="Нет расписания :("
                    />
                ) : (<>
                    <SchedulePanelDateSelector
                        date={date}
                        setDate={setDate}
                    />
                    <ScheduleDay
                        daySchedule={getScheduleByDate(schedule.schedule, date)}
                        subgroup={null}
                        showTeacher={true}
                        showClassroom={false}
                        showGroup={true}
                    />
                    <Footer>
                        Обновлено {formatDateWithTime(new Date(schedule.meta.update_time * 1000))}<br/>
                        В расписании не учитываются замены и переносы
                    </Footer>
                </>)}
            </Group>
        </Panel>
    );
}

function ScheduleDisciplinePanel({id}: { id: string }) {
    const [date, setDate] = useState(new Date());

    // @ts-ignore
    const {disciplineId} = useParams<"disciplineId">();

    const {
        isLoading,
        ok,
        message: apiError,
        response: schedule,
    } = useApiRequest(`schedule/disciplines/${disciplineId}`, undefined, res => res.data);

    return (
        <Panel id={id}>
            <PanelHeader>Расписание</PanelHeader>
            <Group>
                <ScheduleSelectorButton
                    text={`Предмет id${disciplineId}`}
                />
                {isLoading ? (
                    <Placeholder
                        icon={<FontAwesomeIcon icon={faSpinner} size="2x" fixedWidth spin/>}
                        title="Загрузка..."
                    />
                ) : !ok ? (
                    <FormItem>
                        <FormStatus mode="error" title="Ошибка">
                            <p>{apiError}</p>
                        </FormStatus>
                    </FormItem>
                ) : (!Array.isArray(schedule.schedule) || schedule.schedule.length <= 0) ? (
                    <Placeholder
                        title="Нет расписания :("
                    />
                ) : (<>
                    <SchedulePanelDateSelector
                        date={date}
                        setDate={setDate}
                    />
                    <ScheduleDay
                        daySchedule={getScheduleByDate(schedule.schedule, date)}
                        subgroup={null}
                        showTeacher={true}
                        showClassroom={true}
                        showGroup={true}
                    />
                    <Footer>
                        Обновлено {formatDateWithTime(new Date(schedule.meta.update_time * 1000))}<br/>
                        В расписании не учитываются замены и переносы
                    </Footer>
                </>)}
            </Group>
        </Panel>
    );
}

function SchedulePanel({id, authInfo, autoSelectGroup = true}: {
    id: string,
    authInfo: AuthInfo | null,
    autoSelectGroup?: boolean
}) {
    const routeNavigator = useRouteNavigator();

    useEffect(() => {
        if (autoSelectGroup && authInfo && authInfo.user.group_title) {
            routeNavigator.replace(`/schedule/groups/${authInfo.user.group_title}`);
        }
    }, [autoSelectGroup, authInfo]);

    return (
        <Panel id={id}>
            <PanelHeader>Расписание</PanelHeader>
            {!authInfo && (
                <Group>
                    <Div>
                        Выберите расписание или <Link onClick={() => routeNavigator.replace('/login')}>
                        авторизуйтесь
                    </Link>
                    </Div>
                </Group>
            )}
            <Group>
                <ScheduleSelector/>
            </Group>
        </Panel>
    );
}

function ScheduleSelectorButton({text}: { text: string }) {
    const [selectorOpen, setSelectorOpen] = useState(false);

    return (<>
        <FormItem>
            <SelectMimicry placeholder="Не выбрана" onClick={() => setSelectorOpen(true)}>
                {text}
            </SelectMimicry>
            <ModalPage open={selectorOpen} onClose={() => setSelectorOpen(false)}>
                <ScheduleSelector
                    onClose={() => setSelectorOpen(false)}
                />
            </ModalPage>
        </FormItem>
    </>);
}

function ScheduleSelector({defaultScheduleType = "groups", onClose = undefined}: {
    onClose?: (group: any) => void,
    defaultScheduleType?: ScheduleType,
}) {
    const [scheduleType, setScheduleType] = useState<ScheduleType>(defaultScheduleType);
    const scheduleStore = useSchedule();

    const routeNavigator = useRouteNavigator();

    return (<>
        <FormItem>
            <SegmentedControl
                options={[
                    {
                        'label': "Группа",
                        'value': "groups",
                        'aria-label': 'Подгруппа 1',
                    },
                    {
                        'label': "Препод.",
                        'value': "teachers",
                        'aria-label': 'Преподаватель',
                    },
                    {
                        'label': "Ауд.",
                        'value': "classrooms",
                        'aria-label': 'Аудитория',
                    },
                    {
                        'label': "Предмет",
                        'value': "disciplines",
                        'aria-label': 'Предмет',
                    },
                ]}
                value={scheduleType}
                onChange={(newValue) => setScheduleType(newValue as ScheduleType)}
            />
        </FormItem>

        {scheduleType === "groups" ? (
            <ScheduleListSelector
                key="groups"
                // apiPath="schedule/groups"
                func={scheduleStore!.getGroupsList}
                responseMiddleware={res => res.data.groups}
                listRender={groups => (
                    groups.map((gr: any) => (
                        <SimpleCell
                            key={`${gr.title}+${gr.speciality_title}`}
                            subtitle={gr.speciality_title}
                            onClick={() => {
                                routeNavigator.push(`/schedule/groups/${gr.title}`);
                                if (onClose && typeof onClose === "function") {
                                    onClose(gr);
                                }
                            }}
                            chevron="always"
                        >
                            {gr.title}
                        </SimpleCell>
                    ))
                )}
            />
        ) : scheduleType === "teachers" ? (
            <ScheduleListSelector
                key="teachers"
                // apiPath="schedule/teachers"
                func={scheduleStore!.getTeachersList}
                responseMiddleware={res => res.data.teachers}
                listRender={teachers => (
                    teachers.map((gr: any) => (
                        <SimpleCell
                            key={gr.id}
                            onClick={() => {
                                routeNavigator.push(`/schedule/teachers/${gr.id}`);
                                if (onClose && typeof onClose === "function") {
                                    onClose(gr);
                                }
                            }}
                            chevron="always"
                        >
                            {gr.last_name} {gr.first_name} {gr.patronymic}
                        </SimpleCell>
                    ))
                )}
            />
        ) : scheduleType === "classrooms" ? (
            <ScheduleListSelector
                key="classrooms"
                // apiPath="schedule/classrooms"
                func={scheduleStore!.getClassroomsList}
                responseMiddleware={res => res.data.classrooms.reduce((acc: any[], cur: any) => {
                    let camp = acc.find(c => c.address === cur.campus.address);
                    if (!camp) {
                        camp = {
                            ...cur.campus,
                            classrooms: [],
                        };
                        acc.push(camp);
                    }
                    camp.classrooms.push({
                        ...cur,
                        campus: undefined,
                    });
                    return acc;
                }, [] as any[])}
                listRender={classrooms => (
                    classrooms.map((gr: any) => (
                        <Group mode="plain" header={
                            <Header size="s">{gr.address || "Без адреса"}</Header>
                        }>
                            {gr.classrooms?.map((cl: any) => (
                                <SimpleCell
                                    key={`${gr.id}-${cl.id}`}
                                    onClick={() => {
                                        routeNavigator.push(`/schedule/classrooms/${gr.id}`);
                                        if (onClose && typeof onClose === "function") {
                                            onClose(gr);
                                        }
                                    }}
                                    chevron="always"
                                >
                                    {gr.abbrev}.{cl.abbrev}
                                </SimpleCell>
                            ))}
                        </Group>
                    ))
                )}
            />
        ) : scheduleType === "disciplines" ? (
            <ScheduleListSelector
                key="disciplines"
                // apiPath="schedule/disciplines"
                func={scheduleStore!.getDisciplinesList}
                responseMiddleware={res => res.data.disciplines}
                listRender={disciplines => (
                    disciplines.map((gr: any) => (
                        <SimpleCell
                            key={gr.id}
                            onClick={() => {
                                routeNavigator.push(`/schedule/disciplines/${gr.id}`);
                                if (onClose && typeof onClose === "function") {
                                    onClose(gr);
                                }
                            }}
                            chevron="always"
                        >
                            {gr.title}
                        </SimpleCell>
                    ))
                )}
            />
        ) : null}

        <div style={{
            height: "var(--vkui_internal--tabbar_height)"
        }}/>
    </>);
}

function ScheduleListSelector<T>({func, responseMiddleware, listRender, funcArgs}: {
    responseMiddleware?: ((res: any) => any) | undefined,
    func: (...args: any[]) => Promise<ApiResponse<T>>,
    listRender: (element: any) => ReactNode,
    funcArgs?: any[]
}) {
    const {
        isLoading,
        ok,
        message: apiError,
        response,
    } = useScheduleStoreApi(func, responseMiddleware, funcArgs);

    return (
        isLoading ? (
            <Placeholder
                icon={<FontAwesomeIcon icon={faSpinner} size="2x" fixedWidth spin/>}
                title="Загрузка..."
            />
        ) : !ok ? (
            <FormItem>
                <FormStatus mode="error" title="Ошибка">
                    <p>{apiError}</p>
                </FormStatus>
            </FormItem>
        ) : (!Array.isArray(response) || response.length <= 0) ? (
            <Placeholder
                title="Нет данных :("
            />
        ) : (
            listRender(response)
        )
    );
}

function useScheduleStoreApi<T>(func: (...args: any[]) => Promise<ApiResponse<T>>, responseMiddleware: ((res: any) => any) | undefined = undefined, args?: any[]) {
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [apiResponse, setApiResponse] = useState<ApiResponse<T> | undefined>(undefined);
    const [updateTicker, setUpdateTicker] = useState(0);

    useEffect(() => {
        func(...(args || []))
            .then((requestRes) => {
                if (!('data' in requestRes) || !requestRes.data || !requestRes.ok) {
                    setApiError('message' in requestRes ? requestRes.message : null);
                    setApiResponse(undefined);
                    setIsLoading(false);
                } else {
                    if (typeof responseMiddleware === "function") {
                        Promise.resolve(responseMiddleware(requestRes))
                            .then((data) => {
                                setApiError(null);
                                setApiResponse({...requestRes, data});
                                setIsLoading(false);
                            })
                            .catch((error) => {
                                setApiError(error);
                                setApiResponse(undefined);
                                setIsLoading(false);
                            });
                    } else {
                        setApiError(null);
                        setApiResponse(requestRes);
                        setIsLoading(false);
                    }
                }
            });
    }, [func, updateTicker, args]);

    return {
        isLoading,
        message: apiError,
        // @ts-ignore
        response: apiResponse?.data,
        status: apiResponse?.status,
        ok: apiResponse?.ok,
        setApiResponse: setApiResponse,
        update: () => setUpdateTicker((updateTicker + 1) % Number.MAX_SAFE_INTEGER),
    };
}

function ScheduleDay({daySchedule, subgroup = null, showTeacher, showClassroom, showGroup}: {
    daySchedule: any,
    subgroup: number | null,
    showTeacher: boolean,
    showClassroom: boolean,
    showGroup: boolean
}) {
    const routeNavigator = useRouteNavigator();
    let skips = 0;
    const lessons = daySchedule.schedule && daySchedule.schedule.reduce((sh: any, les: any, lesInd: number) => {
        if (les) {
            const sgLes = subgroup === null ? (
                les
            ) : (
                les.filter((l: any) => l.subgroups === subgroup || l.subgroups === 0)
            );
            if (sgLes.length >= 1) {
                if (skips > 0) {
                    if (sh.length > 0) {
                        sh.push(
                            <Group key={-lesInd} mode="plain">
                                <Div style={{textAlign: "center", color: "var(--vkui--color_text_secondary)"}}>
                                    <FontAwesomeIcon icon={faMugHot} fixedWidth/> Перерыв {skips} пары
                                </Div>
                            </Group>
                        );
                    }
                    skips = 0;
                }
                sh.push(
                    <Group key={lesInd} mode="plain">
                        {sgLes.map((lesSg: any) => (
                            <Div>
                                {lesSg.times ? (
                                    <Paragraph style={{
                                        display: "flex",
                                        justifyContent: "space-between"
                                    }}>
                                        <span>
                                            {lesInd + 1}
                                            {lesSg.subgroups !== 0 && `(${lesSg.subgroups})`}
                                            {" "}
                                            {lesSg.type.title}
                                        </span>
                                        <span>{lesSg.times.start}-{lesSg.times.end}</span>
                                    </Paragraph>
                                ) : (
                                    <Paragraph>{lesInd + 1} {lesSg.type.title} {lesSg.times.start}-{lesSg.times.end}</Paragraph>
                                )}
                                <Spacing size={8}/>
                                <Paragraph>{lesSg.discipline.title}</Paragraph>
                                <Spacing size={8}/>
                                <Paragraph>{reactJoin([
                                    showGroup && (
                                        <Button
                                            mode="link"
                                            onClick={() => {
                                                routeNavigator.push(`/schedule/groups/${lesSg.group?.title}`);
                                            }}
                                        >
                                            {lesSg.group?.title}
                                        </Button>
                                    ),
                                    showClassroom && lesSg.classroom?.campus && (
                                        <Button
                                            mode="link"
                                            onClick={() => {
                                                routeNavigator.push(`/schedule/classrooms/${lesSg.classroom.id}`);
                                            }}
                                        >
                                            {lesSg.classroom.campus.abbrev}.{lesSg.classroom.title}
                                        </Button>
                                    ),
                                    showTeacher && lesSg.teacher && (
                                        <Button
                                            mode="link"
                                            onClick={() => {
                                                routeNavigator.push(`/schedule/teachers/${lesSg.teacher.id}`);
                                            }}
                                        >
                                            {lesSg.teacher.last_name} {lesSg.teacher.first_name} {lesSg.teacher.patronymic}
                                        </Button>
                                    )
                                ].filter(s => !!s), " - ")}</Paragraph>
                            </Div>
                        ))}
                    </Group>
                );
            }
        } else {
            skips++;
        }

        return sh;
    }, [] as any[]);

    if (!daySchedule.schedule || lessons.length <= 0) {
        return (
            <Group mode="plain">
                <Div style={{textAlign: "center", color: "var(--vkui--color_text_secondary)"}}>
                    <FontAwesomeIcon icon={faBolt} fixedWidth/> Выходной
                </Div>
            </Group>
        );
    }

    return (<>
        {lessons}
    </>);
}

function getScheduleByDate(schedule: any, date: Date) {
    const dayOfWeek = getWeekDayNum(date) - 1;
    const weekNum = (getWeekNumber(date) + 1) % 2;
    return {
        date: date,
        dayOfWeek: dayOfWeek,
        weekNum: weekNum,
        schedule: schedule[weekNum][dayOfWeek]
    };
}

export default Index;
