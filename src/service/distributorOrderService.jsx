
const baseURL = process.env.REACT_APP_API_BASE_URL;
const API_BASE_URL = `${baseURL}/distributorOrder`;

export const placeOrder = async (orderData) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Auth token not found");

  const response = await fetch(`${API_BASE_URL}/`, {
    method: "POST",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to place order");
  }

  return await response.json();
};

export const getOrdersService = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Auth token not found");

  const response = await fetch(`${API_BASE_URL}/orders/read`, {
    method: "POST",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to get orders");
  }

  return await response.json();
};

export const statusOrderService = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Auth token not found");

  const response = await fetch(`${API_BASE_URL}/status`, {
    method: "POST",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update status");
  }

  return await response.json();
};

export const updateOrderService = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Auth token not found");

  const response = await fetch(`${API_BASE_URL}/update`, {
    method: "POST",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update status");
  }

  return await response.json();
};

export const deleteOrderService = async (id) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Auth token not found");

  const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
    method: "POST",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete order");
  }

  return await response.json();
};


