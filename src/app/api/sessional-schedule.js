import axios from "axios";
import { api_url } from ".";

export const getSessionalSchedules = (batch, section) =>
    axios.get(api_url(`/schedule/sessional/${batch}/${section}`)).then((res) => res.data);

export const setSessionalSchedules = (batch, section, department, schedules) =>
    axios.post(api_url(`/schedule/sessional/${batch}/${section}/${department}`), schedules).then((res) => res.data);

export const roomContradiction = (batch, section, course_id) =>
    axios.get(api_url(`/schedule/contradiction/room/${batch}/${section}/${course_id}`)).then((res) => res.data);

export const teacherContradiction = (batch, section, course_id) =>
    axios.get(api_url(`/schedule/contradiction/teacher/${batch}/${section}/${course_id}`)).then((res) => res.data);

export const getDepartmentalSessionalSchedule = () =>
    axios.get(api_url("/schedule/sessional/departmental")).then((res) => res.data);