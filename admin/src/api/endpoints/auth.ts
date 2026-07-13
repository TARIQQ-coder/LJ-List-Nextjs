import client from "../client";

export const adminLogin = async (phone_number: string, password: string) => {
  const { data } = await client.post("/admin/auth/login", {
    phone_number,
    password,
  });
  return data;
};

export const fetchProfile = async () => {
  const { data } = await client.get("/profile");
  return data;
};

export const logout = async () => {
  await client.post("/auth/logout");
};

export const resendOtp = async (phone_number: string) => {
  const { data } = await client.post("/auth/resend-otp", { phone_number });
  return data;
};

export const verifyOtp = async (phone_number: string, otp: string) => {
  const { data } = await client.post("/auth/verify-otp", {
    phone_number,
    otp,
  });
  return data;
};
