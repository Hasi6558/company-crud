export const PERMISSION_LABELS: Record<string, string> = {
  'read:users': 'Read all users',
  'read:user': 'Read user',
  'create:users': 'Create users',
  'update:users': 'Update users',
  'delete:users': 'Delete users',
  'read:roles': 'Read roles',
  'create:roles': 'Create roles',
  'update:roles': 'Update roles',
  'delete:roles': 'Delete roles',
};

export const PERMISSION_OPTIONS = [
  { label: 'Read all users', value: 'read:users' },
  { label: 'Read user', value: 'read:user' },
  { label: 'Create users', value: 'create:users' },
  { label: 'Update users', value: 'update:users' },
  { label: 'Delete users', value: 'delete:users' },
  { label: 'Read roles', value: 'read:roles' },
  { label: 'Create roles', value: 'create:roles' },
  { label: 'Update roles', value: 'update:roles' },
  { label: 'Delete roles', value: 'delete:roles' },
];
