
const baseURL = process.env.REACT_APP_API_BASE_URL;
const API_BASE_URL = `${baseURL}/order`;
// const API_BASE_URL = `http://localhost:5000/api/order`;

export const SrPerformance = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Auth token not found");

  const response = await fetch(`${API_BASE_URL}/report`, {
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
    throw new Error(error.message || "Failed to retrieve report");
  }

  return await response.json();
};


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

  const response = await fetch(`${API_BASE_URL}/all/area`, {
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

export const getOrdersSRService = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Auth token not found");
  const response = await fetch(`${API_BASE_URL}/all/sr`, {
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

export const deleteOrderService = async (id) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Auth token not found");

  const response = await fetch(`${API_BASE_URL}/remove/${id}`, {
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


export const salesReportService = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Auth token not found");

  const response = await fetch(`${API_BASE_URL}/sales/report`, {
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
    throw new Error(error.message || "Failed to get sales report");
  }

  return await response.json();
};

export const exportOrdersCsvService = async (exportParams) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Auth token not found");

  const response = await fetch(`${API_BASE_URL}/csv/export`, {
    method: "POST",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(exportParams),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to export CSV");
  }

  const blob = await response.blob();
  return blob;
};