import {createContext, Dispatch, ReactNode, useContext, useEffect, useState} from "react";
import {LocalScheduleContextProvider, LocalScheduleProviderProps, useLocalSchedule} from "../LocalScheduleProvider";
import api, {ApiResponse} from "../../api.ts";

export interface ScheduleProviderProps {
    localSchedule: LocalScheduleProviderProps | null,
    getGroupsList: () => Promise<ApiResponse<any>>,
    getTeachersList: () => Promise<ApiResponse<any>>,
    getClassroomsList: () => Promise<ApiResponse<any>>,
    getDisciplinesList: () => Promise<ApiResponse<any>>,
    scheduleType: "local" | "online",
    setScheduleType: Dispatch<"local" | "online">,
};

export const ScheduleContext = createContext<ScheduleProviderProps | null>(null);

export const ScheduleContextProvider = ({children}: { children?: ReactNode }) => {
    return (
        <LocalScheduleContextProvider>
            <ScheduleContextProviderInner children={children}/>
        </LocalScheduleContextProvider>
    );
};

const ScheduleContextProviderInner = ({children}: { children?: ReactNode }) => {
    const localSchedule = useLocalSchedule();
    const [scheduleType, setScheduleType] = useState<"local" | "online">("online");

    useEffect(() => {
        setScheduleType(localSchedule?.schedule?.meta ? "local" : "online");
    }, [localSchedule]);

    async function getGroupsList(): Promise<ApiResponse<any>> {
        if (scheduleType === "online") {
            return await api.getRequest("schedule/groups");
        } else {
            return {
                ok: true,
                status: 1,
                data: {
                    groups: localSchedule!.schedule.groups.map((g: any) => ({
                        ...g,
                        speciality_title: g.speciality.title,
                        faculty_title: g.speciality.faculty.title,
                    })),
                },
                // type: "local",
                // ts: Date.now(),
            };
        }
    }

    async function getTeachersList(): Promise<ApiResponse<any>> {
        if (scheduleType === "online") {
            return await api.getRequest("schedule/teachers");
        } else {
            return {
                ok: true,
                status: 1,
                data: {
                    teachers: localSchedule!.schedule.teachers,
                },
            };
        }
    }

    async function getClassroomsList(): Promise<ApiResponse<any>> {
        if (scheduleType === "online") {
            return await api.getRequest("schedule/classrooms");
        } else {
            console.log(`localSchedule!.schedule.classrooms`, localSchedule!.schedule.classrooms)
            return {
                ok: true,
                status: 1,
                data: {
                    classrooms: localSchedule!.schedule.classrooms,
                },
            };
        }
    }

    async function getDisciplinesList(): Promise<ApiResponse<any>> {
        if (scheduleType === "online") {
            return await api.getRequest("schedule/disciplines");
        } else {
            return {
                ok: true,
                status: 1,
                data: {
                    disciplines: localSchedule!.schedule.disciplines,
                },
            };
        }
    }

    return (
        <ScheduleContext.Provider value={{
            localSchedule,
            getGroupsList,
            getTeachersList,
            getClassroomsList,
            getDisciplinesList,
            scheduleType,
            setScheduleType,
        }}>
            {children}
        </ScheduleContext.Provider>
    );
};

export const useSchedule = () => useContext(ScheduleContext);
