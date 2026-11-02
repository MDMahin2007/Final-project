export const isSuperAdmin = (role) => role === "superAdmin" || role === "admin";

export const getRoleHome = (role) => {
  if (role === "officeStaff") return "/staff/requests";
  if (isSuperAdmin(role)) return "/admin/dashboard";
  return "/student/dashboard";
};