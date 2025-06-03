const baseURL = process.env.REACT_APP_API_BASE_URL;
const API_BASE_URL = `${baseURL}/user`;
// const API_BASE_URL = `http://localhost:5000/api/user`;

export const singleSRService = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Auth token not found");

  const response = await fetch(`${API_BASE_URL}/srDetails`, {
    method: "POST",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || "Failed to fetch SR Details ");
  }

  return await response.json();
};

export const fetchSRDetails = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Auth token not found");

  const response = await fetch(`${API_BASE_URL}/srs`, {
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || "Failed to fetch SRs");
  }

  return await response.json();
};

export const fetchDistDetails = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Auth token not found");

  const response = await fetch(`${API_BASE_URL}/dists`, {
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || "Failed to fetch Distributors");
  }

  return await response.json();
};
