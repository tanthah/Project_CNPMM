// frontend/src/api/faqApi.js
import axios from './axios';

export const getAllFAQs = async () => {
    const response = await axios.get('/faqs');
    return response.data;
};

export const getFAQById = async (id) => {
    const response = await axios.get(`/faqs/${id}`);
    return response.data;
};
export const getCategories = async () => {
    const response = await axios.get('/faq-categories');
    return response.data;
};
