import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FoodContext } from "../FoodContext";
import TopSettingsBar from "../components/TopSettingsBar";
import { useSettings } from "../SettingsContext";
import { API_BASE_URL } from "../config";

function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const {
    orders = [],
    menuItems = [],
    deliveryUsers = [],
    adminUsers = [],
    ordersError = "",
    addMenuItem,
    deleteMenuItem,
    updateOrderStatus,
    assignDeliveryTask,
    deleteOrder,
    updateUserRoleToDelivery,
    refreshData,
  } = useContext(FoodContext) || {};

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [selectedDeliveryByOrder, setSelectedDeliveryByOrder] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").toLowerCase();
    if (!token || !role.includes("admin")) navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (refreshData) refreshData();
  }, [refreshData]);

  const toStatus = (status) => String(status || "").toLowerCase();
  const pendingOrders = orders.filter((o) => toStatus(o.status) === "pending");
  const approvedOrders = orders.filter((o) => toStatus(o.status) === "approved");
  const deliveredOrders = orders.filter((o) => toStatus(o.status) === "delivered");
  const receivedOrders = orders.filter((o) => toStatus(o.status) === "received");
  const rejectedOrders = orders.filter((o) => toStatus(o.status) === "rejected");
  const specialOrders = orders.filter((o) => Boolean(o.special_request_name));
  const menuOrders = orders.filter((o) => !o.special_request_name);
  const registeredCustomers = adminUsers.filter((u) => !u.is_staff && !u.is_superuser);
  const pendingDeliveryRequests = registeredCustomers.filter((u) => u.delivery_request_pending);

  const statusClass = (status) => {
    const s = toStatus(status);
    if (s === "pending") return "bg-danger";
    if (s === "approved") return "bg-success";
    if (s === "rejected") return "bg-secondary";
    if (s === "delivering") return "bg-primary";
    if (s === "delivered") return "bg-dark";
    if (s === "received") return "bg-info";
    return "bg-secondary";
  };

  const getOrderFood = (order) => {
    if (order?.special_request_name) return order.special_request_name;
    if (order?.food && order.food !== "-") return order.food;
    return "-";
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    if (!foodName || !price || !imageFile) {
      setMessage("Jaza jina, bei na picha.");
      setMessageType("error");
      return;
    }

    const result = await addMenuItem({ name: foodName, price, description, imageFile });
    if (result?.ok) {
      setFoodName("");
      setPrice("");
      setDescription("");
      setImageFile(null);
      setShowModal(false);
      setMessage("Menu mpya imeongezwa.");
      setMessageType("success");
      return;
    }

    setMessage(result?.message || "Imeshindikana kuongeza menu.");
    setMessageType("error");
  };

  const handleApproveOrder = async (orderId) => {
    const result = await updateOrderStatus(orderId, "Approved");
    if (result?.ok) {
      setMessage("Order imekuwa Approved.");
      setMessageType("success");
    } else {
      setMessage(result?.message || "Imeshindikana kuapprove order.");
      setMessageType("error");
    }
  };

  const handleRejectOrder = async (orderId) => {
    const result = await updateOrderStatus(orderId, "Rejected");
    if (result?.ok) {
      setMessage("Order imekataliwa.");
      setMessageType("success");
    } else {
      setMessage(result?.message || "Imeshindikana kukataa order.");
      setMessageType("error");
    }
  };

  const handleAssignDelivery = async (orderId) => {
    const deliveryId = selectedDeliveryByOrder[orderId];
    if (!deliveryId) {
      setMessage("Chagua delivery person kwanza.");
      setMessageType("error");
      return;
    }
    const result = await assignDeliveryTask(orderId, deliveryId);
    if (result?.ok) {
      setMessage("Order imeassigniwa delivery.");
      setMessageType("success");
    } else {
      setMessage(result?.message || "Imeshindikana kuassign delivery.");
      setMessageType("error");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const result = await deleteOrder(orderId);
    if (result?.ok) {
      setMessage("Order imefutwa.");
      setMessageType("success");
    } else {
      setMessage(result?.message || "Imeshindikana kufuta order.");
      setMessageType("error");
    }
  };

  const handleDeleteMenu = async (itemId) => {
    const result = await deleteMenuItem(itemId);
    if (result?.ok) {
      setMessage("Menu imefutwa.");
      setMessageType("success");
    } else {
      setMessage(result?.message || "Imeshindikana kufuta menu.");
      setMessageType("error");
    }
  };

  const handleSetDeliveryRole = async (userId, makeDelivery) => {
    const result = await updateUserRoleToDelivery(userId, makeDelivery);
    if (result?.ok) {
      setMessage(result.message || "Role imebadilika.");
      setMessageType("success");
    } else {
      setMessage(result?.message || "Imeshindikana kubadili role.");
      setMessageType("error");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="app-page">
      <nav className="navbar navbar-dark bg-dark px-4 py-3 shadow-sm w-100">
        <div className="container-fluid d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <h5 className="text-white-50 m-0 fw-bold text-uppercase">{t("adminDashboard")}</h5>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <TopSettingsBar />
            <h4 className="fw-bold text-warning m-0">Home Food System</h4>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              {t("logout")}
            </button>
          </div>
        </div>
      </nav>

      <div className="p-4">
        {message && (
          <div className={`small fw-bold mb-3 ${messageType === "success" ? "text-success" : "text-danger"}`}>
            {message}
          </div>
        )}
        {ordersError && (
          <div className="small fw-bold mb-3 text-danger">
            Orders error: {ordersError}
          </div>
        )}

        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 border-start border-danger border-4">
              <div className="small text-muted fw-bold">Pending</div>
              <h3 className="m-0 text-danger">{pendingOrders.length}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 border-start border-success border-4">
              <div className="small text-muted fw-bold">Approved</div>
              <h3 className="m-0 text-success">{approvedOrders.length}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 border-start border-primary border-4">
              <div className="small text-muted fw-bold">From Menu</div>
              <h3 className="m-0 text-primary">{menuOrders.length}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 border-start border-warning border-4">
              <div className="small text-muted fw-bold">{t("specialOrders")}</div>
              <h3 className="m-0 text-warning">{specialOrders.length}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 border-start border-dark border-4">
              <div className="small text-muted fw-bold">Delivered</div>
              <h3 className="m-0 text-dark">{deliveredOrders.length}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 border-start border-secondary border-4">
              <div className="small text-muted fw-bold">Rejected</div>
              <h3 className="m-0 text-secondary">{rejectedOrders.length}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 border-start border-info border-4">
              <div className="small text-muted fw-bold">{t("customerConfirmed")}</div>
              <h3 className="m-0 text-info">{receivedOrders.length}</h3>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h6 className="fw-bold m-0">Menu Management</h6>
            <button className="btn btn-dark btn-sm" onClick={() => setShowModal(true)}>
              + Weka Menu Mpya
            </button>
          </div>
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Picha</th>
                  <th>Chakula</th>
                  <th>Bei</th>
                  <th>Hatua</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.length > 0 ? (
                  menuItems.map((item) => {
                    const src = item?.image
                      ? String(item.image).startsWith("http")
                        ? item.image
                        : `${API_BASE_URL}${item.image}`
                      : "https://via.placeholder.com/120x80?text=No+Image";
                    return (
                      <tr key={item.id}>
                        <td>
                          <img src={src} alt={item.name} style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "8px" }} />
                        </td>
                        <td className="fw-bold">{item.name}</td>
                        <td>{item.price}</td>
                        <td>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteMenu(item.id)}>
                            Futa
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">
                      Hakuna menu bado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h6 className="fw-bold m-0">Customers Registration (Admin achague Delivery)</h6>
            <span className="badge bg-primary">
              {registeredCustomers.length} users | Pending Requests: {pendingDeliveryRequests.length}
            </span>
          </div>
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Total Orders</th>
                  <th>Request</th>
                  <th>Role Action</th>
                </tr>
              </thead>
              <tbody>
                {registeredCustomers.length > 0 ? (
                  registeredCustomers.map((u) => (
                    <tr key={u.id}>
                      <td className="fw-bold">#{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.email || "-"}</td>
                      <td>{u.phone || "-"}</td>
                      <td>{u.total_orders || 0}</td>
                      <td>
                        {u.delivery_request_pending ? (
                          <span className="badge bg-warning text-dark">Pending Delivery Request</span>
                        ) : (
                          <span className="badge bg-light text-dark">No Request</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {u.is_delivery_person ? (
                            <button
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => handleSetDeliveryRole(u.id, false)}
                            >
                              Rudisha Customer
                            </button>
                          ) : (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleSetDeliveryRole(u.id, true)}
                            >
                              Mpe Delivery Role
                            </button>
                          )}
                          {u.delivery_request_pending && (
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleSetDeliveryRole(u.id, false)}
                            >
                              Kataa Request
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      Hakuna customer wa kuonyesha.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-white">
            <h6 className="fw-bold m-0">Orders kutoka kwa Customer</h6>
          </div>
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Chakula</th>
                  <th>Mteja</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Note</th>
                  <th>Order Type</th>
                  <th>Time</th>
                  <th>Delivery</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td className="fw-bold">#{order.id}</td>
                      <td className="fw-bold">{getOrderFood(order)}</td>
                      <td>{order.customer_name || order.customer || "-"}</td>
                      <td>{order.phone || "-"}</td>
                      <td>{order.customer_email || order.email || "-"}</td>
                      <td>{order.location || "-"}</td>
                      <td>{order.specialRequest || order.customer_note || order.special_request_description || "-"}</td>
                      <td className="text-capitalize">{order.order_type || (order.special_request_name ? "special" : "menu")}</td>
                      <td>{order.created_at ? new Date(order.created_at).toLocaleString() : "-"}</td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <small className="text-success fw-bold">{order.delivery_person_name || "Bado"}</small>
                          <select
                            className="form-select form-select-sm"
                            value={selectedDeliveryByOrder[order.id] || ""}
                            onChange={(e) =>
                              setSelectedDeliveryByOrder((prev) => ({
                                ...prev,
                                [order.id]: e.target.value,
                              }))
                            }
                          >
                            <option value="">Chagua</option>
                            {deliveryUsers.map((delivery) => (
                              <option value={delivery.id} key={delivery.id}>
                                {delivery.username}
                              </option>
                            ))}
                          </select>
                          <button className="btn btn-outline-primary btn-sm" onClick={() => handleAssignDelivery(order.id)}>
                            Assign
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${statusClass(order.status)} px-3 py-2`}>{order.status}</span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {toStatus(order.status) === "pending" && (
                            <button className="btn btn-success btn-sm" onClick={() => handleApproveOrder(order.id)}>
                              Approve
                            </button>
                          )}
                          {toStatus(order.status) === "pending" && (
                            <button className="btn btn-warning btn-sm" onClick={() => handleRejectOrder(order.id)}>
                              Reject
                            </button>
                          )}
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteOrder(order.id)}>
                            Futa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="text-center text-muted py-4">
                      Hakuna order kwa sasa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="fw-bold m-0">Weka Menu Mpya</h6>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleAddFood}>
                <div className="modal-body">
                  <input type="file" className="form-control mb-3" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} required />
                  <input type="text" className="form-control mb-3" placeholder="Jina la chakula" value={foodName} onChange={(e) => setFoodName(e.target.value)} required />
                  <input type="number" className="form-control mb-3" placeholder="Bei" value={price} onChange={(e) => setPrice(e.target.value)} required />
                  <textarea className="form-control" rows="3" placeholder="Maelezo" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger">
                    Save
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

export default AdminDashboard;
