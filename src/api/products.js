import axios from "axios";

// adjust if your backend URL is different
const api = axios.create({ baseURL: "http://localhost:5000/api" });

export const listProducts  = (params) => api.get("/products", { params }).then(r => r.data);
export const createProduct = (formData) =>
  api.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } })
     .then(r => r.data);
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload).then(r => r.data);
export const adjustStock   = (id, delta) => api.patch(`/products/${id}/adjust-stock`, { delta }).then(r => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then(r => r.data);