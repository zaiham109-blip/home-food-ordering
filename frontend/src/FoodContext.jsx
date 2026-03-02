import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "./config";

export const FoodContext = createContext();

const parseList = (data) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  const firstArray = Object.values(data).find((value) => Array.isArray(value));
  return Array.isArray(firstArray) ? firstArray : [];
};

const parseErrorMessage = (data, fallback) => {
  if (!data || typeof data !== "object") return fallback;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.error === "string") return data.error;
  if (typeof data.message === "string") return data.message;
  const firstArrayError = Object.values(data).find((value) => Array.isArray(value) && value.length > 0);
  if (firstArrayError) return String(firstArrayError[0]);
  return fallback;
};

export const FoodProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveryUsers, setDeliveryUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [ordersError, setOrdersError] = useState("");
  const refreshingRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    const phone = localStorage.getItem("phone");

    if (token && userId) {
      setUser({
        id: Number(userId),
        username: username || "",
        role: role || "",
        email: email || "",
        phone: phone || "",
        is_customer: localStorage.getItem("is_customer") === "true",
        is_delivery_person: localStorage.getItem("is_delivery_person") === "true",
        delivery_request_pending: localStorage.getItem("delivery_request_pending") === "true",
      });
    }
  }, []);

  const authFetch = async (url, options = {}, isJson = false) => {
    const token = localStorage.getItem("token");
    const baseHeaders = options.headers || {};
    const defaultHeaders = isJson ? { "Content-Type": "application/json" } : {};

    if (!token) {
      return fetch(url, { ...options, headers: { ...defaultHeaders, ...baseHeaders } });
    }

    const schemes = ["Token", "Bearer"];
    let fallbackResponse = null;

    for (const scheme of schemes) {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...baseHeaders,
          Authorization: `${scheme} ${token}`,
        },
      });

      if (response.status !== 401) return response;
      fallbackResponse = response;
    }

    return fallbackResponse;
  };

  const refreshData = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    try {
      const [foodsRes, ordersRes] = await Promise.all([
        authFetch(`${API_URL}/foods/`, { method: "GET" }),
        authFetch(`${API_URL}/orders/`, { method: "GET" }),
      ]);

      const foodsData = await foodsRes.json().catch(() => []);
      const ordersData = await ordersRes.json().catch(() => ({}));
      setMenuItems(parseList(foodsData));
      if (ordersRes.ok) {
        setOrders(parseList(ordersData));
        setOrdersError("");
      } else {
        setOrders([]);
        setOrdersError(parseErrorMessage(ordersData, "Imeshindikana kuvuta orders."));
      }

      const role = (localStorage.getItem("role") || "").toLowerCase();
      if (role.includes("admin")) {
        const [deliveryRes, usersRes] = await Promise.all([
          authFetch(`${API_URL}/delivery-users/`, { method: "GET" }),
          authFetch(`${API_URL}/admin-users/`, { method: "GET" }),
        ]);
        setDeliveryUsers(parseList(await deliveryRes.json().catch(() => [])));
        setAdminUsers(parseList(await usersRes.json().catch(() => [])));
      } else {
        setDeliveryUsers([]);
        setAdminUsers([]);
      }
    } catch (error) {
      console.error("refreshData error:", error);
      setOrdersError("Network error wakati wa kuvuta orders.");
    } finally {
      refreshingRef.current = false;
    }
  }, []);

  useEffect(() => {
    refreshData();

    const runRefresh = () => {
      if (document.visibilityState === "visible") {
        refreshData();
      }
    };

    const intervalId = setInterval(runRefresh, 12000);
    document.addEventListener("visibilitychange", runRefresh);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", runRefresh);
    };
  }, [refreshData]);

  const addMenuItem = async (newItem) => {
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("price", String(newItem.price));
      formData.append("description", newItem.description || "");
      if (newItem.imageFile) formData.append("image", newItem.imageFile);

      const response = await authFetch(`${API_URL}/foods/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return { ok: false, message: parseErrorMessage(data, "Imeshindikana kuongeza menu.") };
      }

      await refreshData();
      return { ok: true };
    } catch (error) {
      console.error("addMenuItem error:", error);
      return { ok: false, message: "Network error wakati wa kuongeza menu." };
    }
  };

  const deleteMenuItem = async (itemId) => {
    try {
      const response = await authFetch(`${API_URL}/foods/${itemId}/`, { method: "DELETE" });
      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => ({}));
        return { ok: false, message: parseErrorMessage(data, "Imeshindikana kufuta menu.") };
      }
      await refreshData();
      return { ok: true };
    } catch (error) {
      console.error("deleteMenuItem error:", error);
      return { ok: false, message: "Network error wakati wa kufuta menu." };
    }
  };

  const placeOrder = async (orderData) => {
    try {
      const isSpecial = orderData.orderType === "special";
      const parsedItemId = Number(orderData.itemId);
      const payload = {
        customer_name: orderData.customerName,
        phone: orderData.phone,
        location: orderData.address,
        specialRequest: orderData.note || "",
        status: "Pending",
      };

      if (orderData.email) payload.email = orderData.email;

      if (isSpecial) {
        payload.food = `SPECIAL: ${orderData.foodName}`;
        payload.special_request_name = orderData.foodName;
        payload.special_request_description = orderData.note || "";
      } else {
        if (Number.isFinite(parsedItemId) && parsedItemId > 0) {
          payload.items = [parsedItemId];
        } else if (orderData.foodName) {
          payload.food = orderData.foodName;
        } else {
          return { ok: false, message: "Chagua chakula cha menu kwanza." };
        }
      }

      const response = await authFetch(
        `${API_URL}/orders/`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        true
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return { ok: false, message: parseErrorMessage(data, "Order imeshindikana kutumwa.") };
      }

      const responseData = await response.json().catch(() => ({}));
      await refreshData();
      return { ok: true, message: responseData?.message || "Order yako imepokelewa kikamilifu." };
    } catch (error) {
      console.error("placeOrder error:", error);
      return { ok: false, message: "Network error wakati wa kutuma order." };
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await authFetch(
        `${API_URL}/orders/${orderId}/`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        },
        true
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return { ok: false, message: parseErrorMessage(data, "Imeshindikana kubadili status.") };
      }

      await refreshData();
      return { ok: true };
    } catch (error) {
      console.error("updateOrderStatus error:", error);
      return { ok: false, message: "Network error wakati wa kubadili status." };
    }
  };

  const assignDeliveryTask = async (orderId, deliveryPersonId) => {
    try {
      const response = await authFetch(
        `${API_URL}/orders/${orderId}/`,
        {
          method: "PATCH",
          body: JSON.stringify({ delivery_person: Number(deliveryPersonId), status: "Approved" }),
        },
        true
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return { ok: false, message: parseErrorMessage(data, "Imeshindikana kuassign delivery.") };
      }

      await refreshData();
      return { ok: true };
    } catch (error) {
      console.error("assignDeliveryTask error:", error);
      return { ok: false, message: "Network error wakati wa kuassign delivery." };
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const response = await authFetch(`${API_URL}/orders/${orderId}/`, { method: "DELETE" });
      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => ({}));
        return { ok: false, message: parseErrorMessage(data, "Imeshindikana kufuta order.") };
      }
      await refreshData();
      return { ok: true };
    } catch (error) {
      console.error("deleteOrder error:", error);
      return { ok: false, message: "Network error wakati wa kufuta order." };
    }
  };

  const confirmOrderReceived = async (orderId) => {
    return updateOrderStatus(orderId, "Received");
  };

  const requestDeliveryRole = async () => {
    try {
      const response = await authFetch(`${API_URL}/customer/request-delivery/`, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { ok: false, message: parseErrorMessage(data, "Imeshindikana kutuma ombi.") };
      }

      const currentUser = {
        ...(user || {}),
        delivery_request_pending: true,
      };
      setUser(currentUser);
      localStorage.setItem("delivery_request_pending", "true");
      return { ok: true, message: data?.message || "Ombi limetumwa kwa admin." };
    } catch (error) {
      console.error("requestDeliveryRole error:", error);
      return { ok: false, message: "Network error wakati wa kutuma ombi." };
    }
  };

  const updateUserRoleToDelivery = async (userId, makeDelivery = true) => {
    try {
      const response = await authFetch(
        `${API_URL}/admin-users/${userId}/role/`,
        {
          method: "PATCH",
          body: JSON.stringify({ make_delivery: makeDelivery }),
        },
        true
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return { ok: false, message: parseErrorMessage(data, "Imeshindikana kubadili role ya user.") };
      }

      const data = await response.json().catch(() => ({}));
      await refreshData();
      return { ok: true, message: data?.message || "Role imebadilishwa." };
    } catch (error) {
      console.error("updateUserRoleToDelivery error:", error);
      return { ok: false, message: "Network error wakati wa kubadili role." };
    }
  };

  return (
    <FoodContext.Provider
      value={{
        menuItems,
        orders,
        deliveryUsers,
        adminUsers,
        ordersError,
        user,
        setUser,
        refreshData,
        addMenuItem,
        deleteMenuItem,
        placeOrder,
        updateOrderStatus,
        assignDeliveryTask,
        deleteOrder,
        confirmOrderReceived,
        updateUserRoleToDelivery,
        requestDeliveryRole,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};
