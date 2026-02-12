import { API_URL } from "@/constants";
import axios, { AxiosError } from "axios";

export const login = async (
  email: string,
  password: string,
): Promise<{ token: string }> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    console.log("got error:", error);

    const err = error as AxiosError<{ msg: string }>;
    const msg = err.response?.data?.msg || "Login failed";

    throw new Error(msg);
  }
};

export const register = async (
  email: string,
  password: string,
  name: string,
  avatar?: string | null,
): Promise<{ token: string }> => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      name,
      avatar,
    });

    return response.data;
  } catch (error) {
    console.log("got error:", error);

    const err = error as AxiosError<{ msg: string }>;
    const msg = err.response?.data?.msg || "Registration failed";

    throw new Error(msg);
  }
};
