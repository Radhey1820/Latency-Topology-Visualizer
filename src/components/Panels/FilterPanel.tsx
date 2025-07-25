import { REGION_COLORS } from '@/constants';

function ProviderFilterPanel({
  filters,
  setFilters,
}: {
  filters: { aws: boolean; azure: boolean; gcp: boolean };
  setFilters: React.Dispatch<
    React.SetStateAction<{ aws: boolean; azure: boolean; gcp: boolean }>
  >;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: '#222c',
        padding: 12,
        borderRadius: 8,
        color: 'white',
        userSelect: 'none',
        zIndex: 1000,
        width: 150,
        fontSize: 14,
      }}
    >
      <b>Cloud Providers</b>
      <div>
        <label>
          <input
            type='checkbox'
            checked={filters.aws}
            onChange={() => setFilters((f) => ({ ...f, aws: !f.aws }))}
          />
          <span style={{ color: REGION_COLORS.aws, marginLeft: 6 }}>AWS</span>
        </label>
      </div>
      <div>
        <label>
          <input
            type='checkbox'
            checked={filters.azure}
            onChange={() => setFilters((f) => ({ ...f, azure: !f.azure }))}
          />
          <span style={{ color: REGION_COLORS.azure, marginLeft: 6 }}>
            Azure
          </span>
        </label>
      </div>
      <div>
        <label>
          <input
            type='checkbox'
            checked={filters.gcp}
            onChange={() => setFilters((f) => ({ ...f, gcp: !f.gcp }))}
          />
          <span style={{ color: REGION_COLORS.gcp, marginLeft: 6 }}>GCP</span>
        </label>
      </div>
    </div>
  );
}

export default ProviderFilterPanel;
