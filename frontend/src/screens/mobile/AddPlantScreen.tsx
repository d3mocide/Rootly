import { T } from '../../tokens';
import { Icon } from '../../components';

interface Props {
  onClose: () => void;
}

function Field({ label, value, placeholder, focused }: { label: string; value?: string; placeholder: string; focused?: boolean }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.ink2, display: 'block', marginBottom: 7 }}>{label}</label>
      <div style={{
        fontFamily: T.sans, fontSize: 15, color: value ? T.ink : T.ink3, background: T.card,
        border: `1.5px solid ${focused ? T.fern : T.stone200}`, borderRadius: 14, padding: '13px 14px',
        boxShadow: focused ? '0 0 0 3px rgba(127,180,142,.4)' : 'none',
      }}>
        {value || placeholder}
      </div>
    </div>
  );
}

export function AddPlantScreen({ onClose }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: T.paper, zIndex: 60, display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '58px 18px 14px' }}>
        <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: '50%', background: T.linen, border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Icon name="x" size={20} color={T.ink} />
        </button>
        <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink }}>Add a plant</div>
        <span style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 600, color: T.ink3 }}>Save</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 12px' }}>
        {/* photo slot */}
        <div style={{
          height: 120, borderRadius: 18, border: `2px dashed ${T.stone300}`, background: T.sprout,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 7, marginBottom: 22,
        }}>
          <Icon name="camera" size={26} color={T.fern} />
          <span style={{ fontFamily: T.sans, fontSize: 13.5, fontWeight: 600, color: T.fern }}>Add a photo</span>
        </div>

        <Field label="Plant name" value="Monstera" placeholder="" />
        <Field label="Species" placeholder="Search species" focused />
        <Field label="Room" value="Living room" placeholder="Choose a room" />
        <Field label="Water every" placeholder="e.g. 9 days" />
      </div>

      {/* mock keyboard */}
      <div style={{ height: 260, background: T.linen, borderTop: `1px solid ${T.stone200}` }} />
    </div>
  );
}
