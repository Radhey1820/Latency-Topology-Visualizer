import { REGION_COLORS } from '@/constants';

type ProviderFilters = {
  aws: boolean;
  azure: boolean;
  gcp: boolean;
};

type ProviderFilterPanelProps = {
  /**
   * Object representing the current filter state for cloud providers.
   * Each key is a provider name and the boolean indicates if the filter is active.
   */
  filters: ProviderFilters;

  /**
   * Setter function to update the filters state.
   * Typically comes from a React useState setter.
   */
  setFilters: React.Dispatch<React.SetStateAction<ProviderFilters>>;
};

/**
 * ProviderFilterPanel renders a UI panel with checkboxes allowing users to filter
 * cloud providers (AWS, Azure, GCP) shown on the map.
 *
 * Each cloud provider can be toggled independently, with color-coded labels matching
 * the respective provider color conventions.
 *
 * The component maintains no internal state; it relies on `filters` and `setFilters` props
 * for controlled state management.
 *
 * @param {ProviderFilterPanelProps} props - Props containing filter states and setter.
 * @returns {JSX.Element} The rendered provider filter panel UI.
 */
function ProviderFilterPanel({
  filters,
  setFilters,
}: ProviderFilterPanelProps) {
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
