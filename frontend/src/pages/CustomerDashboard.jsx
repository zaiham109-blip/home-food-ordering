import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FoodContext } from "../FoodContext";
import TopSettingsBar from "../components/TopSettingsBar";
import { useSettings } from "../SettingsContext";

function CustomerDashboard() {
  const navigate = useNavigate();
  const {
    menuItems = [],
    orders = [],
    placeOrder,
    user,
    refreshData,
    requestDeliveryRole,
    confirmOrderReceived,
  } = useContext(FoodContext) || {};
  const { t } = useSettings();

  const [showModal, setShowModal] = useState(false);
  const [orderType, setOrderType] = useState("menu");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [formData, setFormData] = useState({
    itemId: "",
    foodName: "",
    customerName: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").toLowerCase();
    if (!token || !role.includes("customer")) navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (refreshData) refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      customerName: user.username || prev.customerName,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
    }));
  }, [user]);

  const openMenuOrder = (item) => {
    setOrderType("menu");
    setMessage("");
    setMessageType("");
    setFormData((prev) => ({
      ...prev,
      itemId: item.id,
      foodName: item.name,
      note: "",
    }));
    setShowModal(true);
  };

  const openSpecialOrder = () => {
    setOrderType("special");
    setMessage("");
    setMessageType("");
    setFormData((prev) => ({
      ...prev,
      itemId: "",
      foodName: "",
      note: "",
    }));
    setShowModal(true);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    const result = await placeOrder({
      orderType,
      itemId: formData.itemId,
      foodName: formData.foodName.trim(),
      customerName: formData.customerName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      note: formData.note.trim(),
    });

    if (result?.ok) {
      setMessage(result?.message || "Order imetumwa.");
      setMessageType("success");
      setShowModal(false);
      return;
    }

    setMessage(result?.message || "Imeshindikana kutuma order.");
    setMessageType("error");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleRequestDelivery = async () => {
    if (!requestDeliveryRole) return;
    const result = await requestDeliveryRole();
    if (result?.ok) {
      setMessage(result.message || "Request imetumwa.");
      setMessageType("success");
      return;
    }
    setMessage(result?.message || "Imeshindikana kutuma request.");
    setMessageType("error");
  };

  const handleConfirmReceived = async (orderId) => {
    const result = await confirmOrderReceived(orderId);
    if (result?.ok) {
      setMessage("Order imewekwa kama Received.");
      setMessageType("success");
      return;
    }
    setMessage(result?.message || "Imeshindikana kuthibitisha order.");
    setMessageType("error");
  };

  const toStatus = (status) => String(status || "").toLowerCase();
  const getFood = (order) => {
    if (order.special_request_name) return order.special_request_name;
    if (order.food && order.food !== "-") return order.food;
    return "-";
  };

  return (
    <div className="app-page">
      <nav className="navbar navbar-dark bg-dark px-4 py-3 shadow-sm w-100">
        <div className="container-fluid d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <h5 className="text-white-50 m-0 fw-bold text-uppercase">{t("customerDashboard")}</h5>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <TopSettingsBar />
            <small className="text-white-50">Karibu, {user?.username || "Customer"}</small>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              {t("logout")}
            </button>
          </div>
        </div>
      </nav>

      <div className="p-3 p-md-4">
        {message && (
          <div className={`small fw-semibold mb-3 ${messageType === "success" ? "text-success" : "text-danger"}`}>
            {message}
          </div>
        )}

        <div className="d-flex align-items-center mb-3">
          <div style={{ height: "4px", width: "48px", backgroundColor: "#0d6efd", marginRight: "10px" }} />
          <h5 className="fw-bold m-0">{t("menuToday")}</h5>
        </div>

        <div className="row g-3">
          {menuItems.length > 0 ? (
            menuItems.map((item) => {
              const imageValue = item?.image || "";
              const imageSrc = imageValue
                ? String(imageValue).startsWith("http")
                  ? imageValue
                  : `http://127.0.0.1:8000${imageValue}`
                : "https://via.placeholder.com/300x180?text=No+Image";

              return (
                <div key={item.id} className="col-6 col-md-4 col-lg-3 col-xl-2">
                  <div className="card h-100 border-0 shadow-sm">
                    <img src={imageSrc} alt={item.name} style={{ height: "120px", objectFit: "cover" }} />
                    <div className="card-body p-2">
                      <div className="fw-bold text-truncate" style={{ fontSize: "0.9rem" }}>
                        {item.name}
                      </div>
                      <div className="text-success fw-bold small">{item.price} TZS</div>
                      <button className="btn btn-primary btn-sm w-100 mt-2 fw-bold" onClick={() => openMenuOrder(item)}>
                        {t("order").toUpperCase()}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12 text-center py-5 text-muted">{t("noMenu")}</div>
          )}
        </div>

        <div className="d-flex justify-content-start mt-4">
          <button className="btn btn-success fw-bold px-4" onClick={openSpecialOrder}>
            {t("specialOrder").toUpperCase()}
          </button>
          <button
            className="btn btn-outline-primary fw-bold px-4 ms-2"
            onClick={handleRequestDelivery}
            disabled={Boolean(user?.delivery_request_pending) || Boolean(user?.is_delivery_person)}
          >
            {user?.is_delivery_person
              ? t("readyDelivery")
              : user?.delivery_request_pending
                ? t("requestPending")
                : t("requestDeliveryRole")}
          </button>
        </div>

        <div className="card border-0 shadow-sm rounded-3 mt-4">
          <div className="card-header bg-white">
            <h6 className="fw-bold m-0">{t("myOrders")}</h6>
          </div>
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>{t("food")}</th>
                  <th>{t("address")}</th>
                  <th>{t("status")}</th>
                  <th>{t("time")}</th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td className="fw-bold">#{order.id}</td>
                      <td>{getFood(order)}</td>
                      <td>{order.location || "-"}</td>
                      <td>
                        <span className="badge bg-secondary">{order.status}</span>
                      </td>
                      <td>{order.created_at ? new Date(order.created_at).toLocaleString() : "-"}</td>
                      <td>
                        {toStatus(order.status) === "delivered" ? (
                          <button className="btn btn-sm btn-success" onClick={() => handleConfirmReceived(order.id)}>
                            {t("confirmReceived")}
                          </button>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      {t("noOrders")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal d-block" style={styles.modalBackdrop}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 bg-light">
                <h6 className="fw-bold m-0">{orderType === "special" ? t("specialOrder") : "Order Form"}</h6>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmitOrder}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="small fw-bold mb-1">{t("food")}</label>
                    <input
                      className="form-control form-control-sm"
                      value={formData.foodName}
                      onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                      disabled={orderType === "menu"}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold mb-1">{t("customer")}</label>
                    <input
                      className="form-control form-control-sm"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold mb-1">{t("phone")}</label>
                    <input
                      className="form-control form-control-sm"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold mb-1">{t("email")}</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold mb-1">{t("address")}</label>
                    <input
                      className="form-control form-control-sm"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="small fw-bold mb-1">{t("note")}</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 bg-light">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm fw-bold px-4">
                    {t("order").toUpperCase()}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  modalBackdrop: {
    backgroundColor: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(3px)",
    zIndex: 3000,
  },
};

export default CustomerDashboard;

