import {ReactNode, useEffect, useState} from "react";

export function clamp(value: number, min: number, max: number) {
    return Math.max(Math.min(value, max), min);
}

export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatSeconds(seconds: number) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds - (hours * 3600)) / 60);
    let secs = seconds - (hours * 3600) - (minutes * 60);

    return (hours < 10 ? '0' + hours : hours) + ':' +
        (minutes < 10 ? '0' + minutes : minutes) + ':' +
        (secs < 10 ? '0' + secs : secs);
}

export function getNowDateUTC() {
    const date = new Date();
    return date.setUTCHours(0, 0, 0, 0);
}

export function addDays(date: Date, days: number) {
    let date2 = new Date(date);
    date2.setDate(date2.getDate() + days);
    return date2;
}

export function getWeekNumber(date: Date) {
    let d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
    let dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getWeekDayNum(date: Date) {
    let day = date.getDay();
    if (day === 0)
        return 7;
    return day;
}

export function weekdayString(date: Date) {
    const weekdays = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
    return weekdays[getWeekDayNum(date) - 1];
}

export function getDateDelta(dateA: number, dateB: number | undefined = undefined) {
    dateB ??= getNowDateUTC();
    return (dateA - dateB) / 1000 / 60 / 60 / 24;
}

export function valueInRange(value: number, min: number, max: number) {
    return min <= value && value <= max;
}

export function reactJoin(elements: ReactNode[], separator: ReactNode = ', ') {
    const result = [];
    for (const element of elements) {
        if (result.length > 0) {
            result.push(separator, element);
        } else {
            result.push(element);
        }
    }
    return result;
}

export function getStartDay(date?: Date, offsetDays: number = 0) {
    date ||= new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offsetDays, 0, 0, 0, 0);
}

export function formatDateWithTime(date: Date | number, withSeconds = false) {
    const formatter = new Intl.DateTimeFormat(navigator.language, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: withSeconds ? "2-digit" : undefined
    });
    return formatter.format(date);
}

export function formatTime(date: Date) {
    return date.toLocaleTimeString(navigator.language, {
        hour: "2-digit",
        minute: "2-digit"
    })
}

export function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0b';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['б', 'кб', 'мб', 'гб', 'тб', 'пб', 'эб', 'зб', 'йб'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// export function debounce(func: () => any, ms: number) {
//     let timeout;
//     return function (...args) {
//         clearTimeout(timeout);
//         timeout = setTimeout(() => func.apply(this, args), ms);
//     };
// }

export const phoneNumberRegex = /^(7|\+7|8)\s?\(?(\d{3})\)?\s?(\d{3})(\s?|-)(\d{2})(\s?|-)(\d{2})$/;

export function formatPhoneNumber(phoneNumber: string) {
    return phoneNumber.replace(phoneNumberRegex, "+7 ($2) $3-$5-$7");
}

export function getSqlDate(date: Date = new Date()) {
    return date.toISOString().slice(0, 10);
}

export function useDebounce(value: any, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(
        () => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            return () => {
                clearTimeout(handler);
            };
        },
        [value]
    );

    return debouncedValue;
}

export type DictObj = { [key: string]: any };
