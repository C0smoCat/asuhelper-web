import {useEffect, useState, createContext, useContext, ReactNode} from "react";
import {API_SI_PATH} from "../../config.ts";

export interface LocalScheduleProviderProps {
    schedule: any,
    setSchedule: (value: (((prevState: null) => null) | null)) => void,
    updateSchedule: () => void
};

export const LocalScheduleContext = createContext<LocalScheduleProviderProps | null>(null);

export const LocalScheduleContextProvider = ({children}: { children?: ReactNode }) => {
    const [schedule, setSchedule] = useState(null);

    useEffect(() => {
        console.log("useEffect", !!localStorage);
        if (localStorage) {
            const storageSchedule = JSON.parse(localStorage.getItem("si") || "null");
            if (storageSchedule && storageSchedule.meta && storageSchedule.meta.schema === 2001) {
                configIndexedSchedule(storageSchedule);
                setSchedule(storageSchedule);
                console.log(`schedule localStorage ${JSON.stringify(storageSchedule.meta)}`);
                if (Date.now() / 1000 - storageSchedule.meta.update_time < 4 * 60 * 60) {
                    return;
                }
            }
        }
        updateSchedule();
    }, []);

    function configIndexedSchedule(schedule: any) {
        for (const group of schedule.groups) {
            group.speciality = schedule.specialities[group.speciality];
            if (!group.speciality.groups) {
                group.speciality.groups = [];
                group.speciality.faculty = schedule.faculties[group.speciality.faculty];
                if (!group.speciality.faculty.specialities) {
                    group.speciality.faculty.specialities = [];
                }
                group.speciality.faculty.specialities.push(group.speciality);
            }
            group.speciality.groups.push(group);

            for (let wi = 0; wi < group.schedule.length; wi++) {
                const week = group.schedule[wi];
                for (let di = 0; di < week.length; di++) {
                    if (week[di]) {
                        for (let li = 0; li < week[di].length; li++) {
                            if (week[di][li]) {
                                for (let sli = 0; sli < week[di][li].length; sli++) {
                                    const subLesson = week[di][li][sli];
                                    if (subLesson) {
                                        subLesson.group = group;
                                        if (Number.isSafeInteger(subLesson.classroom)) {
                                            subLesson.classroom = schedule.classrooms[subLesson.classroom];
                                            if (!subLesson.classroom.groups) {
                                                subLesson.classroom.groups = [];
                                            }
                                            subLesson.classroom.groups.push(group);

                                            if (!subLesson.classroom.schedule) {
                                                subLesson.classroom.schedule = [new Array(7).fill(null), new Array(7).fill(null)];
                                            }
                                            if (!subLesson.classroom.schedule[wi][di]) {
                                                subLesson.classroom.schedule[wi][di] = [];
                                            }
                                            while (subLesson.classroom.schedule[wi][di].length < li) {
                                                subLesson.classroom.schedule[wi][di].push(null);
                                            }
                                            if (!subLesson.classroom.schedule[wi][di][li]) {
                                                subLesson.classroom.schedule[wi][di][li] = [];
                                            }
                                            subLesson.classroom.schedule[wi][di][li].push(subLesson);
                                        }
                                        if (Number.isSafeInteger(subLesson.teacher)) {
                                            subLesson.teacher = schedule.teachers[subLesson.teacher];
                                            if (!subLesson.teacher.groups) {
                                                subLesson.teacher.groups = [];
                                            }
                                            subLesson.teacher.groups.push(group);
                                            if (!subLesson.teacher.schedule) {
                                                subLesson.teacher.schedule = [new Array(7).fill(null), new Array(7).fill(null)];
                                            }
                                            if (!subLesson.teacher.schedule[wi][di]) {
                                                subLesson.teacher.schedule[wi][di] = [];
                                            }
                                            while (subLesson.teacher.schedule[wi][di].length < li) {
                                                subLesson.teacher.schedule[wi][di].push(null);
                                            }
                                            if (!subLesson.teacher.schedule[wi][di][li]) {
                                                subLesson.teacher.schedule[wi][di][li] = [];
                                            }
                                            subLesson.teacher.schedule[wi][di][li].push(subLesson);
                                        }
                                        if (Number.isSafeInteger(subLesson.lessonType)) {
                                            subLesson.lessonType = schedule.lessonTypes[subLesson.lessonType];
                                        }
                                        if (Number.isSafeInteger(subLesson.discipline)) {
                                            subLesson.discipline = schedule.disciplines[subLesson.discipline];
                                            if (!subLesson.discipline.groups) {
                                                subLesson.discipline.groups = [];
                                            }
                                            subLesson.discipline.groups.push(group);

                                            if (!subLesson.discipline.schedule) {
                                                subLesson.discipline.schedule = [new Array(7).fill(null), new Array(7).fill(null)];
                                            }
                                            if (!subLesson.discipline.schedule[wi][di]) {
                                                subLesson.discipline.schedule[wi][di] = [];
                                            }
                                            while (subLesson.discipline.schedule[wi][di].length < li) {
                                                subLesson.discipline.schedule[wi][di].push(null);
                                            }
                                            if (!subLesson.discipline.schedule[wi][di][li]) {
                                                subLesson.discipline.schedule[wi][di][li] = [];
                                            }
                                            subLesson.discipline.schedule[wi][di][li].push(subLesson);
                                        }
                                        if (subLesson.teacher && subLesson.discipline) {
                                            if (!subLesson.teacher.disciplines) {
                                                subLesson.teacher.disciplines = [];
                                            }
                                            subLesson.teacher.disciplines.push(subLesson.discipline);

                                            if (!subLesson.discipline.teachers) {
                                                subLesson.discipline.teachers = [];
                                            }
                                            subLesson.discipline.teachers.push(subLesson.teacher);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        for (const teacher of schedule.teachers) {
            const [last_name, first_name, patronymic] = teacher.fio;
            teacher.last_name = last_name;
            teacher.first_name = first_name;
            teacher.patronymic = patronymic;
            delete teacher.fio;
        }

        for (const classroom of schedule.classrooms) {
            if (Number.isSafeInteger(classroom.campus)){
                classroom.campus = schedule.campuses[classroom.campus];
            }
        }
    }

    function updateSchedule() {
        fetch(API_SI_PATH + `si_latest`)
            .then(res => res.json())
            .then(newSchedule => {
                console.log(`schedule updated ${JSON.stringify(newSchedule.meta)}`);
                if (newSchedule.meta && newSchedule.meta.schema === 2001) {
                    if (localStorage) {
                        localStorage.setItem("si", JSON.stringify(newSchedule));
                    }
                    configIndexedSchedule(newSchedule);
                    setSchedule(newSchedule);
                }
            })
            .catch(err => console.log(err))
        ;
    }

    return (
        <LocalScheduleContext.Provider value={{
            schedule,
            setSchedule,
            updateSchedule,
        }}>
            {children}
        </LocalScheduleContext.Provider>
    );
};

export const useLocalSchedule = () => useContext(LocalScheduleContext);
