import {
  showContextMenu,
  DialogButton,
  Menu,
  MenuItem,
  findModuleChild
} from 'decky-frontend-lib';
import { FC, useState, useEffect, useCallback } from 'react';
import DialogCheckbox, { DialogCheckboxProps } from '../components/DialogCheckbox';
import Chevron from '../components/Chevron';
import t from '../utils/i18n';

const dropDownControlButtonClass = findModuleChild((m) => {
  if (typeof m !== 'object') return undefined;
  for (const prop in m) {
    if (m[prop]?.toString()?.includes('gamepaddropdown_DropDownControlButton')) {
      return m[prop];
    }
  }
});

const DropdownMultiselectItem: FC<{
  value: any,
  onSelect: (checked: boolean, value: any) => void,
  checked: boolean
} & DialogCheckboxProps> = ({
  value,
  onSelect,
  checked: defaultChecked,
  ...rest
}) => {
  const [checked, setChecked] = useState(defaultChecked);

  useEffect(() => {
    onSelect?.(checked, value);
  }, [checked, onSelect, value]);

  return (
    <MenuItem
      bInteractableItem
      onClick={() => setChecked((x) => !x)}
      onOKActionDescription={t('Select')}
    >
      <DialogCheckbox
        style={{ marginBottom: 0, padding: 0 }}
        bottomSeparator="none"
        {...rest}
        onClick={() => setChecked((x) => !x)}
        onChange={(checked) => setChecked(checked)}
        controlled
        checked={checked}
      />
    </MenuItem>
  );
};

const DropdownMultiselect: FC<{
  items: {
    label: string,
    value: any,
  }[],
  selected: any[],
  onSelect: (selected: any[]) => void,
  label: string
}> = ({
  label,
  items,
  selected,
  onSelect
}) => {
  const [itemsSelected, setItemsSelected] = useState<any>(selected);

  const handleItemSelect = useCallback((checked, value) => {
    setItemsSelected((x: any) => (checked ?
      [...x.filter((y: any) => y !== value), value] :
      x.filter((y: any) => y !== value)
    ));
  }, []);

  useEffect(() => {
    onSelect(itemsSelected);
  }, [itemsSelected, onSelect]);

  return (
    <DialogButton
      style={{
        display: 'flex',
        alignItems: 'center',
        maxWidth: '100%'
      }}
      className={dropDownControlButtonClass}
      onClick={(evt) => {
        evt.preventDefault();
        showContextMenu(
          <Menu
            label={label}
            cancelText={t('Back')}
          >
            {items.map((x) => <DropdownMultiselectItem
              key={x.value}
              label={x.label}
              value={x.value}
              checked={itemsSelected.includes(x.value)}
              onSelect={handleItemSelect}
            />)}
          </Menu>,
          evt.currentTarget ?? window
        );
      }}
    >
      <span style={{
        flex: '1 1 100%',
        maxWidth: 'inherit',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {
          selected.length > 0 ?
            selected.map((x: any) => items[items.findIndex((v) => v.value === x)].label).join(', ') :
            '…'
        }
      </span>
      <div style={{ flexGrow: 1, minWidth: '1ch' }} />
      <Chevron style={{ height: '1em' }} direction="down" />
    </DialogButton>
  );
};

export default DropdownMultiselect;
