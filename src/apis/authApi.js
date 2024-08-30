import axiosClient from "../configs/axiosClient";

const authApi = {
    login: async function ({ email, password }) {
        return axiosClient.post("/auth/login", {
            email,
            password,
        });
    },
    register: async function ({ email, password, name }) {
        return axiosClient.post("/auth/register", { email, password, name });
    },

    resetAccessToken: async function (refreshToken) {
        return axiosClient.put("/auth/reset-token", {
            refreshToken,
        });
    },
    loginByGoogle: async (credential) => {
        return axiosClient.post("/auth/oauth2/google", { credential });
    },
};

export default authApi;