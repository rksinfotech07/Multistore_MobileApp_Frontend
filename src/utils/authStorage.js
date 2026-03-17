export const saveToken = (token, role) => {
  if (role === "admin") {
    localStorage.setItem("admin_token", token);
  } else {
    localStorage.setItem("vendor_token", token);
  }
};

export const getToken = () => {
  return (
    localStorage.getItem("admin_token") ||
    localStorage.getItem("vendor_token")
  );
};

export const removeToken = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("vendor_token");
};