import axios from "axios";
import { api_url } from ".";


export const getAllTeachers = () =>
    axios.get(api_url(`/online/get/all`)).then((res) => res.data);

export const getTeacherByInitial = (initial) =>
    axios.get(api_url(`/online/get/${initial}`)).then((res) => res.data);

export const addTeacher = (teacher) =>
    axios.post(api_url(`/online/add`), teacher).then((res) => res.data);

export const editTeacher = (initial, teacher) =>
    axios.put(api_url(`/online/edit/${initial}`), teacher).then((res) => res.data);

export const deleteTeacher = (initial) =>
    axios.delete(api_url(`/online/delete/${initial}`)).then((res) => res.data);