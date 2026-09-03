import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const defaultSettings = {
  store: {
    appName: 'POS PRIMA',
    appSubtitle: 'INDONESIA POINT OF SALE',
    logoUrl: '', // Custom logo image URL / base64 data URL
    name: 'POS PRIMA INDONESIA',
    tagline: 'Sistem Kasir 16 Modul Terpadu',
    address: 'Jl. Jenderal Sudirman Kav. 52-53, Senayan, Jakarta Selatan',
    phone: '(021) 5790-1234 / 0812-3456-7890',
    email: 'info@posprima.co.id',
    website: 'https://posprima.co.id',
    npwp: '01.234.567.8-012.000',
    taxPercentage: 11,
    enableTax: true,
    qrisUrl: localStorage.getItem('pos_custom_qris_link') || '',
    currencySymbol: 'Rp',
    receiptHeader: 'Terima kasih atas kunjungan Anda!',
    receiptFooter: 'Barang yang sudah dibeli dapat ditukar maksimal 2x24 jam dengan membawa struk asli.',
    enableLoyalty: true,
    pointsPer10k: 1,
    pointValueInRp: 100,
    theme: 'light'
  }
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('pos_custom_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return defaultSettings;
  });
  const [loading, setLoading] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getSettings();
      if (res.success && res.settings) {
        setSettings(prev => ({
          ...prev,
          ...res.settings,
          store: {
            ...prev.store,
            ...(res.settings.store || {})
          }
        }));
      }
    } catch (err) {
      console.warn('Using local settings cache');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Update document title whenever app name changes
  useEffect(() => {
    const appName = settings?.store?.appName || 'POS PRIMA';
    document.title = `${appName} - Sistem Kasir & Manajemen Modul`;
    localStorage.setItem('pos_custom_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = async (newSettingsData) => {
    setLoading(true);
    try {
      const merged = {
        ...settings,
        ...newSettingsData,
        store: {
          ...settings.store,
          ...(newSettingsData.store || {})
        }
      };
      setSettings(merged);
      localStorage.setItem('pos_custom_settings', JSON.stringify(merged));

      // Sync with backend API
      try {
        await api.updateSettings(merged);
      } catch (err) {
        console.warn('Backend sync failed, saved locally');
      }

      return merged;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, reloadSettings: loadSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    return {
      settings: defaultSettings,
      updateSettings: () => {},
      reloadSettings: () => {},
      loading: false
    };
  }
  return ctx;
}
