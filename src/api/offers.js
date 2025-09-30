import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:5000/api" });

export const listOffers  = (params) => api.get("/offers", { params }).then(r => r.data);
export const createOffer = (payload) => api.post("/offers", payload).then(r => r.data);
export const updateOffer = (id, payload) => api.put(`/offers/${id}`, payload).then(r => r.data);
export const toggleOffer = (id) => api.patch(`/offers/${id}/toggle`).then(r => r.data);
export const deleteOffer = (id) => api.delete(`/offers/${id}`).then(r => r.data);