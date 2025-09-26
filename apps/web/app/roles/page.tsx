'use client';
import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'antd';
import SharedLayout from '@/components/SharedLayout';
import RoleTable from '@/components/RoleTable';
import EditPermissionsModal from '@/components/EditPermissionsModal';
import { Role } from '@/types';
import api from '@/app/lib/axios';
import AddRoleModal from '@/components/AddRoleModal';

const RolesPage: React.FC = () => {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoleToDelete, setSelectedRoleToDelete] = useState<Role | null>(null);
  const [editPermissionsRole, setEditPermissionsRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditPermissionsModalOpen, setIsEditPermissionsModalOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);

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
  const handleAddRole = (roleName: string) => {
    console.log('Add Role clicked');
    setIsAddRoleModalOpen(true);
  };
  const addRole = async (roleName: string) => {
    try {
      if (!roleName) return;
      const roleDataToSend = { name: roleName };
      await api.post('/roles', roleDataToSend);
      setIsAddRoleModalOpen(false);
      await loadRoles();
    } catch (error) {
      console.error('Failed to add role:', error);
    }
  };

  return (
    <SharedLayout>
      <div>
        <h2 className="text-lg font-semibold mb-4">User Roles</h2>
        <div className="flex justify-end">
          <Button
            type="primary"
            onClick={() => handleAddRole('New Role')}
            style={{ marginBottom: '10px' }}
          >
            + Add Role
          </Button>
        </div>

        <AddRoleModal
          open={isAddRoleModalOpen}
          onCancel={() => setIsAddRoleModalOpen(false)}
          addRole={addRole}
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
