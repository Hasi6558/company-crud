export enum Permissions {
  // User permissions
  READ_USERS = 'read:users',
  READ_PROFILE = 'read:user',
  CREATE_USERS = 'create:users',
  UPDATE_USERS = 'update:users',
  DELETE_USERS = 'delete:users',

  // Role permissions
  READ_ROLES = 'read:roles',
  CREATE_ROLES = 'create:roles',
  UPDATE_ROLES = 'update:roles',
  DELETE_ROLES = 'delete:roles',

  // Admin permissions
  ADMIN_ALL = 'admin:all',
  ADMIN_EDIT = 'admin:edit',
}
