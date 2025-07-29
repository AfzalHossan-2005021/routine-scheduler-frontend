import axios from "axios";
import { api_url } from ".";

export const getVersions = () => {
    return axios.get(api_url("/versions")).then((res) => res.data);
};

export const saveVersion = (versionName) => {
    return axios.post(api_url("/versions/save"), { versionName }).then((res) => res.data);
};

export const loadVersion = (filename) => {
    return axios.post(api_url(`/versions/load/${filename}`)).then((res) => res.data);
};

export const deleteVersion = (filename) => {
    return axios.delete(api_url(`/versions/${filename}`)).then((res) => res.data);
};
