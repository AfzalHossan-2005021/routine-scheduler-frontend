import axios from "axios";
import { api_url } from ".";


export const getAllTeachers = () =>
    axios.get(api_url(`/online/get/all`)).then((res) => res.data);
