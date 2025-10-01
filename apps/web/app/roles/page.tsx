'use client';
import React, { useState, useEffect } from 'react';
import { Button, Modal, FormInstance } from 'antd';
import SharedLayout from '@/components/SharedLayout';
import RoleTable from '@/components/RoleTable';
import EditPermissionsModal from '@/components/EditPermissionsModal';
import { Role } from '@/types';
import api from '@/app/lib/axios';
import AddRoleModal from '@/components/AddRoleModal';
import { usePermission } from '@/components/UsePermissions';

const RolesPage: React.FC = () => {
  const { can } = usePermission();
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoleToDelete, setSelectedRoleToDelete] = useState<Role | null>(null);
  const [editPermissionsRole, setEditPermissionsRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditPermissionsModalOpen, setIsEditPermissionsModalOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [roleForm, setRoleForm] = useState<FormInstance | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await api.get('/roles');
      setAllRoles(response.data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const handleEditPermissions = (role: Role) => {
    setEditPermissionsRole(role);
    setSelectedPermissions(role.permissions || []);
    setIsEditPermissionsModalOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    setSelectedRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const handlePermissionChange = (checkedValues: string[]) => {
    setSelectedPermissions(checkedValues);
  };

  const handleSavePermissions = async () => {
    try {
      if (!editPermissionsRole) return;

      await api.patch(`/roles/${editPermissionsRole.id}`, {
        permissions: selectedPermissions,
      });

      setIsEditPermissionsModalOpen(false);
      await loadRoles();
      console.log('Permissions updated successfully');
    } catch (error) {
      console.error('Failed to update permissions:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedRoleToDelete) return;

      await api.delete(`/roles/${selectedRoleToDelete.id}`);
      setIsDeleteModalOpen(false);
      await loadRoles();
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };
  const handleAddRole = () => {
    console.log('Add Role clicked');
    setIsAddRoleModalOpen(true);
  };
  const addRole = async (roleName: string) => {
    try {
      if (!roleName) return;
      const roleDataToSend = { name: roleName };
      await api.post('/roles', roleDataToSend);

      // Only reset form and close modal on successful creation
      if (roleForm) {
        roleForm.resetFields();
      }
      setIsAddRoleModalOpen(false);
      await loadRoles();
    } catch (e: unknown) {
      if (
        typeof e === 'object' &&
        e !== null &&
        'response' in e &&
        typeof (e as { response?: unknown }).response === 'object' &&
        (e as { response?: { status?: number; data?: { message?: string[] } } }).response !== null
      ) {
        const { status, data } = (
          e as { response: { status?: number; data?: { message?: string[] } } }
        ).response;

        if (status === 400 && Array.isArray(data?.message) && roleForm) {
          // Map validation errors to form fields
          const fieldErrors: { name: string; errors: string[] }[] = [];

          data.message.forEach((msg: string) => {
            console.log('Processing role error:', msg);

            // Map error messages to form fields
            if (msg.includes('name')) {
              fieldErrors.push({ name: 'roleName', errors: [msg] });
            } else if (msg.includes('description')) {
              fieldErrors.push({ name: 'description', errors: [msg] });
            }
          });

          console.log('Setting role form field errors:', fieldErrors);
          roleForm.setFields(fieldErrors);
        } else if (status === 409 && roleForm) {
          // Handle role name already exists error
          const errorMessage = Array.isArray(data?.message)
            ? data.message[0]
            : data?.message || 'Role name already exists';
          roleForm.setFields([
            {
              name: 'roleName',
              errors: [errorMessage],
            },
          ]);
        }
      }
      console.log('Failed to add role:', e);
    }
  };

  return (
    <SharedLayout>
      <div>
        <h2 className="text-2xl font-semibold mb-4">User Roles</h2>
        <div className="flex justify-end">
          <Button
            type="primary"
            onClick={() => handleAddRole()}
            style={{ marginBottom: '10px' }}
            disabled={!can(['create:roles'])}
          >
            + Add Role
          </Button>
        </div>

        <AddRoleModal
          open={isAddRoleModalOpen}
          onCancel={() => {
            setIsAddRoleModalOpen(false);
            if (roleForm) {
              roleForm.resetFields();
            }
          }}
          addRole={addRole}
          onFormReady={setRoleForm}
        />

        <RoleTable
          roles={allRoles}
          onEditPermissions={handleEditPermissions}
          onDeleteRole={handleDeleteRole}
        />

        {/* Edit Permissions Modal */}
        <EditPermissionsModal
          open={isEditPermissionsModalOpen}
          role={editPermissionsRole}
          selectedPermissions={selectedPermissions}
          onCancel={() => setIsEditPermissionsModalOpen(false)}
          onSave={handleSavePermissions}
          onPermissionChange={handlePermissionChange}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          title="Confirm Deletion"
          open={isDeleteModalOpen}
          onOk={handleDeleteConfirm}
          onCancel={() => setIsDeleteModalOpen(false)}
          okText="Delete"
          okButtonProps={{ danger: true }}
        >
          <p>
            Are you sure you want to delete role <strong>{selectedRoleToDelete?.name}</strong>?
          </p>
        </Modal>
      </div>
    </SharedLayout>
  );
};

export default RolesPage;
