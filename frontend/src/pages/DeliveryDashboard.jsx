import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FoodContext } from "../FoodContext";
import TopSettingsBar from "../components/TopSettingsBar";
import { useSettings } from "../SettingsContext";

function DeliveryDashboard() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const { orders = [], updateOrderStatus, user, refreshData } = useContext(FoodContext) || {};

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").toLowerCase();
    if (!token || !role.includes("delivery")) navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (refreshData) refreshData();
  }, [refreshData]);

  const myId = user?.id || Number(localStorage.getItem("userId") || 0);
  const myOrders = orders.filter((order) => {
    const deliveryId = Number(order.delivery_person_id || order.delivery_person || 0);
    const status = String(order.status || "").toLowerCase();
    return deliveryId === myId && (status === "approved" || status === "ready" || status === "delivering");
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const startDelivering = async (orderId) => {
    await updateOrderStatus(orderId, "Delivering");
  };

  const markDelivered = async (orderId) => {
    await updateOrderStatus(orderId, "Delivered");
  };

  const getFood = (order) => {
    if (order.special_request_name) return order.special_request_name;
    if (order.food && order.food !== "-") return order.food;
    return "-";
  };

  return (
    <div className="app-page">
      <nav className="navbar navbar-dark bg-dark px-4 py-3 shadow-sm w-100">
        <div className="container-fluid d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <h5 className="text-white-50 m-0 fw-bold text-uppercase">{t("deliveryDashboard")}</h5>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <TopSettingsBar />
            <small className="text-white-50">Delivery: {user?.username || "-"}</small>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              {t("logout")}
            </button>
          </div>
        </div>
      </nav>

      <div className="p-4">
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm p-3 border-start border-success border-4">
              <div className="small text-muted fw-bold">Approved / Ready</div>
              
              <h3 className="m-0 text-success">
                {myOrders.filter((o) => ["approved", "ready"].includes(String(o.status || "").toLowerCase())).length}
              </h3>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow-sm p-3 border-start border-primary border-4">
              <div className="small text-muted fw-bold">Delivering</div>
              <h3 className="m-0 text-primary">{myOrders.filter((o) => String(o.status || "").toLowerCase() === "delivering").length}</h3>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-white">
            <h6 className="fw-bold m-0">Orders zangu za Delivery</h6>
          </div>
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Chakula</th>
                  <th>Mteja</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.length > 0 ? (
                  myOrders.map((order) => {
                    const status = String(order.status || "").toLowerCase();
                    return (
                      <tr key={order.id}>
                        <td className="fw-bold">#{order.id}</td>
                        <td className="fw-bold">{getFood(order)}</td>
                        <td>{order.customer_name || order.customer || "-"}</td>
                        <td>{order.phone || "-"}</td>
                        <td>{order.location || "-"}</td>
                        <td>
                          <span className={`badge ${status === "delivering" ? "bg-primary" : "bg-success"} px-3 py-2`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          {status === "delivering" ? (
                            <button className="btn btn-dark btn-sm" onClick={() => markDelivered(order.id)}>
                              {t("markDelivered")}
                            </button>
                          ) : (
                            <button className="btn btn-primary btn-sm" onClick={() => startDelivering(order.id)}>
                              {t("startDelivery")}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      Hakuna order ulizopewa kwa sasa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryDashboard;
