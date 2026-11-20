export const ADMIN_ID = "admin@gmail.com";
export const ADMIN_PASSWORD = "Admin@123";
export const ADMIN_NAME = "Kinjal Chamadiya";

export function isAdminLogin(adminId: string, password: string) {
  return adminId.trim().toLowerCase() === ADMIN_ID && password === ADMIN_PASSWORD;
}
