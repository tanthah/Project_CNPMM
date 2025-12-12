// frontend/src/api/addressApi.js
import axiosClient from './axios'

const addressApi = {
    getAddresses: () => {
        return axiosClient.get('/addresses')
    },
    getAddressDetail: (addressId) => {
        return axiosClient.get(`/addresses/${addressId}`)
    },
    createAddress: (data) => {
        return axiosClient.post('/addresses/create', data)
    },
    updateAddress: (addressId, data) => {
        return axiosClient.put(`/addresses/${addressId}`, data)
    },
    deleteAddress: (addressId) => {
        return axiosClient.delete(`/addresses/${addressId}`)
    },
    setDefaultAddress: (addressId) => {
        return axiosClient.put(`/addresses/${addressId}/set-default`)
    }
}

export default addressApi