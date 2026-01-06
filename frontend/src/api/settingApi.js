import axiosClient from './axios';

const settingApi = {
    get: () => {
        return axiosClient.get('/settings');
    }
};

export default settingApi;
