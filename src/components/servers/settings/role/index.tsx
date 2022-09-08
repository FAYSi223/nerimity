import styles from './styles.module.scss';
import RouterEndpoints from '@/common/RouterEndpoints';
import { useNavigate, useParams } from '@solidjs/router';
import { createEffect,  createSignal,  For,  on, Show,} from 'solid-js';
import useStore from '@/chat-api/store/useStore';
import { createUpdatedSignal } from '@/common/createUpdatedSignal';
import SettingsBlock from '@/components/ui/settings-block';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { deleteServerChannel, updateServerChannel, updateServerRole } from '@/chat-api/services/ServerService';
import Modal from '@/components/ui/modal';
import { Channel } from '@/chat-api/store/useChannels';
import Checkbox from '@/components/ui/checkbox';
import { addPermission, CHANNEL_PERMISSIONS, getAllPermissions, removePermission, ROLE_PERMISSIONS } from '@/chat-api/Permissions';
import DeleteConfirmModal from '@/components/ui/delete-confirm-modal';
import { ServerRole } from '@/chat-api/store/useServerRoles';
import Icon from '@/components/ui/icon';



export default function ServerSettingsRole() {
  const {serverId, id: roleId} = useParams();
  const { tabs, serverRoles } = useStore();

  const [saveRequestSent, setSaveRequestSent] = createSignal(false);
  const [error, setError] = createSignal<null | string>(null);
  const [showDeleteConfirm, setDeleteConfirm] = createSignal(false);

  const role = () => serverRoles.get(serverId, roleId);



  
  const defaultInput = () => ({
    name: role()?.name || '',
    hexColor: role()?.hexColor || "#fff",
    permissions: role()?.permissions || 0
  })
  
  
  const [inputValues, updatedInputValues, setInputValue] = createUpdatedSignal(defaultInput);
  
  const permissions = () => getAllPermissions(ROLE_PERMISSIONS, inputValues().permissions);


  
  createEffect(on(role, () => {
    tabs.openTab({
      title: "Settings - " + role()?.name,
      serverId: serverId!,
      iconName: 'settings',
      path: RouterEndpoints.SERVER_SETTINGS_ROLE(serverId!, roleId),
    });
  }))


  const onSaveButtonClicked = async () => {
    if (saveRequestSent()) return;
    setSaveRequestSent(true);
    setError(null);
    const values = updatedInputValues();
    await updateServerRole(serverId!, role()?.id!, values)
      .catch((err) => setError(err.message))
      .finally(() => setSaveRequestSent(false));
  }


  const saveRequestStatus = () => saveRequestSent() ? 'Saving...' : 'Save Changes';


  const onPermissionChanged = (checked: boolean, bit: number) => {
    let newPermission = inputValues().permissions;
    if (checked) {
      newPermission = addPermission(newPermission, bit);
    }
    if (!checked) {
      newPermission = removePermission(newPermission, bit);
    }
    setInputValue("permissions", newPermission);
  }

  return (
    <div class={styles.channelPane}>
      {/* Role Name */}
      <SettingsBlock icon='edit' label='Role Name'>
        <Input value={inputValues().name} onText={(v) => setInputValue('name', v) } />
      </SettingsBlock>

      {/* Role Color */}
      <SettingsBlock icon='colorize' label='Role Color'>
        <ColorPicker color={inputValues().hexColor} />
      </SettingsBlock>

      <div class={styles.permissions}>
        <SettingsBlock icon="security" label="Permissions" description="Manage permissions for this role." header={true} />
        <For each={ permissions()}>
          {(permission) => (
            <SettingsBlock icon={permission.icon} label={permission.name} description={permission.description} class={styles.permissionItem}>
              <Checkbox checked={permission.hasPerm} onChange={checked => onPermissionChanged(checked, permission.bit, )} />
            </SettingsBlock>
          )}

        </For>
      </div>

      {/* Delete Role */}
      <Modal show={showDeleteConfirm() && !!role()} title={`Delete ${role()?.name}`} component={() => <ChannelDeleteConfirmModal role={role()!} />} />
      <SettingsBlock icon='delete' label='Delete this role' description='This cannot be undone!'>
        <Button label='Delete Role' color='var(--alert-color)' onClick={() => setDeleteConfirm(true)} />
      </SettingsBlock>
      {/* Errors & buttons */}
      <Show when={error()}><div class={styles.error}>{error()}</div></Show>
      <Show when={Object.keys(updatedInputValues()).length}>
        <Button iconName='save' label={saveRequestStatus()} class={styles.saveButton} onClick={onSaveButtonClicked} />
      </Show>
    </div>
  )
}

function ChannelDeleteConfirmModal(props: {role: ServerRole}) {
  const params = useParams();
  const navigate = useNavigate();
  const {tabs} = useStore();
  const [error, setError] = createSignal<string | null>(null);
  
  const onDeleteClick = async () => {
    setError(null);
    deleteServerChannel(props.role?.serverId!, props.role.id).then(() => {
      const path = RouterEndpoints.SERVER_SETTINGS_CHANNELS(params.serverId!);
      tabs.updateTab(location.pathname, {path})
      navigate(path);
    }).catch(err => {
      setError(err.message);
    })
  }

  return (
    <DeleteConfirmModal 
      errorMessage={error()}
      confirmText={props.role.name}
      onDeleteClick={onDeleteClick}
    />
  )
}


function ColorPicker(props: {color: string}) {
  return (
    <div class={styles.colorPicker} style={{background: props.color}}>
      <Icon name='colorize' color='white' size={18} class={styles.icon} />
    </div>
  )
}