import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const SettingsContext = createContext(null);

const translations = {
  sw: {
    language: "Lugha",
    theme: "Mwonekano",
    light: "Light",
    dark: "Dark",
    swahili: "Kiswahili",
    english: "Kiingereza",
    logout: "Toka",
    customerDashboard: "Dashibodi ya Mteja",
    adminDashboard: "Dashibodi ya Admin",
    deliveryDashboard: "Dashibodi ya Delivery",
    menuToday: "Menu ya Leo",
    specialOrder: "Special Order",
    requestDeliveryRole: "Omba Role ya Delivery",
    requestPending: "Request Inasubiri Approval",
    readyDelivery: "Uko tayari Delivery",
    order: "Order",
    noMenu: "Hakuna menu kwa sasa.",
    myOrders: "Orders Zangu",
    confirmReceived: "Thibitisha Nimepokea",
    noOrders: "Hakuna order kwa sasa.",
    status: "Status",
    food: "Chakula",
    customer: "Mteja",
    phone: "Phone",
    email: "Email",
    address: "Address",
    note: "Note",
    actions: "Action",
    orderType: "Aina ya Order",
    time: "Muda",
    delivery: "Delivery",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    delivered: "Delivered",
    delivering: "Delivering",
    received: "Received",
    fromMenu: "Kutoka Menu",
    specialOrders: "Special Orders",
    customerConfirmed: "Customer Confirmed",
    menuManagement: "Usimamizi wa Menu",
    ordersFromCustomers: "Orders kutoka kwa Customers",
    startDelivery: "Anza Delivery",
    markDelivered: "Weka Delivered",
    myDeliveryOrders: "Orders zangu za Delivery",
    approvedReady: "Approved / Ready",
    signupTitle: "Tengeneza Akaunti",
    loginTitle: "Ingia kuendelea",
    username: "Username",
    password: "Password",
    createAccount: "Jisajili",
    hasNoAccount: "Huna account?",
    alreadyAccount: "Tayari una account?",
    login: "Ingia",
    signup: "Jisajili hapa",
  },
  en: {
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    swahili: "Swahili",
    english: "English",
    logout: "Logout",
    customerDashboard: "Customer Dashboard",
    adminDashboard: "Admin Dashboard",
    deliveryDashboard: "Delivery Dashboard",
    menuToday: "Today's Menu",
    specialOrder: "Special Order",
    requestDeliveryRole: "Request Delivery Role",
    requestPending: "Request Pending Approval",
    readyDelivery: "You are Delivery",
    order: "Order",
    noMenu: "No menu available right now.",
    myOrders: "My Orders",
    confirmReceived: "Confirm Received",
    noOrders: "No orders available.",
    status: "Status",
    food: "Food",
    customer: "Customer",
    phone: "Phone",
    email: "Email",
    address: "Address",
    note: "Note",
    actions: "Action",
    orderType: "Order Type",
    time: "Time",
    delivery: "Delivery",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    delivered: "Delivered",
    delivering: "Delivering",
    received: "Received",
    fromMenu: "From Menu",
    specialOrders: "Special Orders",
    customerConfirmed: "Customer Confirmed",
    menuManagement: "Menu Management",
    ordersFromCustomers: "Orders From Customers",
    startDelivery: "Start Delivery",
    markDelivered: "Mark Delivered",
    myDeliveryOrders: "My Delivery Orders",
    approvedReady: "Approved / Ready",
    signupTitle: "Create Account",
    loginTitle: "Sign in to continue",
    username: "Username",
    password: "Password",
    createAccount: "Create Account",
    hasNoAccount: "No account?",
    alreadyAccount: "Already have an account?",
    login: "Login",
    signup: "Sign up here",
  },
};

const getInitialLanguage = () => localStorage.getItem("language") || "sw";
const getInitialTheme = () => localStorage.getItem("theme") || "light";

export function SettingsProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const value = useMemo(() => {
    const table = translations[language] || translations.sw;
    const t = (key, fallback = "") => table[key] || fallback || key;
    return { language, setLanguage, theme, setTheme, t };
  }, [language, theme]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }
  return ctx;
}

