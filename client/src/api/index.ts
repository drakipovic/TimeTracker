import { LoginData, RegisterData, WorkEntry } from "model";

const parseResponse = (response: Response) => {
  return new Promise((resolve, reject) => {
    try {
      if (response.status === 204) {
        resolve();
      } else {
        resolve(response.json());
      }
    } catch (error) {
      reject(error);
    }
  });
};

const checkResponse = (response: Response): Response => {
  if (response.status >= 200 && response.status < 400) return response;

  //no auth token or token expired
  if (response.status === 401 || response.status === 422)
    window.location.replace("/login");

  const error = new Error(response.statusText);
  throw error;
};

export const getJson = (url: string, headers: {}) => {
  return fetch(`/api/${url}`, { headers })
    .then(checkResponse)
    .then(parseResponse);
};

const sendJson = (url: string, body: {}, method = "POST", headers: {}) => {
  headers = {
    "Content-Type": "application/json",
    ...headers
  };

  return fetch(`/api/${url}`, {
    method: method,
    body: JSON.stringify(body),
    headers
  })
    .then(checkResponse)
    .then(parseResponse);
};

const getAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`
});

export const login = (data: LoginData) => sendJson("login", data, "POST", {});

export const register = (data: RegisterData) =>
  sendJson("register", data, "POST", {});

export const fetchCurrentUser = () =>
  getJson("current-user", getAuthHeader(localStorage.getItem("token") || ""));

export const putUser = (
  id: number,
  data: { email: string; prefferedWorkingHourPerDay: number, role: string, name: string, username: string }
) =>
  sendJson(
    `users/${id}`,
    data,
    "PUT",
    getAuthHeader(localStorage.getItem("token") || "")
  );

export const fetchUsers = () =>
  getJson("users", getAuthHeader(localStorage.getItem("token") || ""));

export const fetchUser = (id: number) =>
  getJson(`users/${id}`, getAuthHeader(localStorage.getItem("token") || ""));

export const fetchUserWorkEntries = (user_id: number) =>
  getJson(
    `work-entries/${user_id}`,
    getAuthHeader(localStorage.getItem("token") || "")
  );

export const fetchFilteredUserWorkEntries = (
  user_id: number,
  start_date: string | null,
  end_date: string | null
) =>
  getJson(
    `work-entries/${user_id}?start_date=${start_date}&end_date=${end_date}`,
    getAuthHeader(localStorage.getItem("token") || "")
  );

export const createWorkEntry = (
  user_id: number,
  data: { hours: number; date: string; notes?: string }
) =>
  sendJson(
    `work-entries/${user_id}`,
    data,
    "POST",
    getAuthHeader(localStorage.getItem("token") || "")
  );

export const putWorkEntry = (work_entry_id: number, data: WorkEntry) =>
  sendJson(
    `work-entries/${work_entry_id}`,
    data,
    "PUT",
    getAuthHeader(localStorage.getItem("token") || "")
  );

export const deleteWorkEntry = (work_entry_id: number) =>
  sendJson(
    `work-entries/${work_entry_id}`,
    {},
    "DELETE",
    getAuthHeader(localStorage.getItem("token") || "")
  );

export const deleteUser = (user_id: number) =>
  sendJson(
    `users/${user_id}`,
    {},
    "DELETE",
    getAuthHeader(localStorage.getItem("token") || "")
  );
