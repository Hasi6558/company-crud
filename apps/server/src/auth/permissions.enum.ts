export enum Permissions {
  // User permissions
  READ_USERS = 'read_users',
  CREATE_USERS = 'create_users',
  UPDATE_USERS = 'update_users',
  DELETE_USERS = 'delete_users',

  // Role permissions
  READ_ROLES = 'read_roles',
  CREATE_ROLES = 'create_roles',
  UPDATE_ROLES = 'update_roles',
  DELETE_ROLES = 'delete_roles',

  // Admin permissions
  ADMIN_ALL = 'admin_all',
  ADMIN_EDIT = 'admin_edit',
}
