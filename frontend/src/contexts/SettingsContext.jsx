import React, { createContext, useState, useEffect } from 'react';
import settingApi from '../api/settingApi';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        general: {
            siteName: 'UTE Shop',
            contactEmail: 'support@tvshop.com',
            supportPhone: '1900 xxxx',
            address: '1 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM',
            footerDescription: 'Hệ thống bán lẻ điện thoại, laptop, tablet và phụ kiện chính hãng uy tín hàng đầu Việt Nam.',
            socialLinks: {
                facebook: '',
                instagram: '',
                youtube: '',
                tiktok: ''
            },
            maintenanceMode: false,
            homepageMessage: ''
        },
        order: {
            allowGuestCheckout: false,
            autoConfirm: false,
            defaultShippingFee: 0
        },
        notification: {
            enableEmailNotifications: true,
            enablePushNotifications: false
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await settingApi.get();
                if (res.data?.data) {
                    setSettings(prev => ({
                        ...prev,
                        ...res.data.data
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch settings, using defaults:', error);
            }
        };

        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={settings}>
            {children}
        </SettingsContext.Provider>
    );
};
