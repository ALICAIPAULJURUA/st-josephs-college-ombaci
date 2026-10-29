import type { Access, FieldAccess } from "payload";

export type Role = "admin" | "editor" | "communications" | "admissions";

type RoleUser = {
  id?: number | string;
  roles?: Role[] | null;
};

const rolesOf = (user: unknown): Role[] => {
  if (!user || typeof user !== "object") return [];
  const roles = (user as RoleUser).roles;
  return Array.isArray(roles) ? roles : [];
};

export const hasRole = (user: unknown, allowed: Role[]): boolean => {
  const roles = rolesOf(user);
  return roles.some((role) => allowed.includes(role));
};

export const anyone: Access = () => true;

export const adminOnly: Access = ({ req: { user } }) =>
  hasRole(user, ["admin"]);

export const authenticated: Access = ({ req: { user } }) => Boolean(user);

export const contentEditors: Access = ({ req: { user } }) =>
  hasRole(user, ["admin", "editor"]);

export const communicationsEditors: Access = ({ req: { user } }) =>
  hasRole(user, ["admin", "editor", "communications"]);

export const admissionsTeam: Access = ({ req: { user } }) =>
  hasRole(user, ["admin", "admissions"]);

export const adminOrSelf: Access = ({ req: { user }, id }) => {
  if (!user) return false;
  if (hasRole(user, ["admin"])) return true;
  return String((user as RoleUser).id) === String(id);
};

export const publishedOrAuthenticated: Access = ({ req }) => {
  if (req.user) return true;
  return { _status: { equals: "published" } };
};

export const isAdminField: FieldAccess = ({ req: { user } }) =>
  hasRole(user, ["admin"]);

export const isAdminOrSelfField: FieldAccess = ({ req: { user }, id }) => {
  if (!user) return false;
  if (hasRole(user, ["admin"])) return true;
  return String((user as RoleUser).id) === String(id);
};

export const isAdmissionsField: FieldAccess = ({ req: { user } }) =>
  hasRole(user, ["admin", "admissions"]);

export const isCommunicationsField: FieldAccess = ({ req: { user } }) =>
  hasRole(user, ["admin", "editor", "communications"]);
