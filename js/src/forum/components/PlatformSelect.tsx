import Component from 'flarum/common/Component';
import m from 'mithril';
import LoanPlatform from '../../common/models/LoanPlatform';

type PlatformSelectAttrs = {
  platforms: LoanPlatform[];
  value: string;
  onchange: (val: string) => void;
};

export default class PlatformSelect extends Component<PlatformSelectAttrs> {
  private open = false;

  view() {
    const { platforms = [], value } = this.attrs as PlatformSelectAttrs;
    const selected = platforms.find((p) => String(p.id()) === value) || null;

    return (
      <div className="LoanPlatformSelector" oncreate={() => document.addEventListener('click', this.handleDocClick)} onremove={() => document.removeEventListener('click', this.handleDocClick)}>
        <div className="LoanPlatformSelector-dropdown" onclick={(e: MouseEvent) => { e.stopPropagation(); this.toggle(); }}>
          <div className="LoanPlatformSelector-selected">
            <div className="LoanPlatformSelector-info">
              <div className="LoanPlatformSelector-icon">
                {selected ? (
                  <img className="PlatformIcon PlatformIcon--medium" src={selected.logoUrl()} alt={selected.name()} />
                ) : (
                  <span className="PlatformIcon PlatformIcon--medium"></span>
                )}
              </div>
              <div className="LoanPlatformSelector-details">
                <div className="LoanPlatformSelector-name">{selected ? selected.name() : '请选择平台'}</div>
              </div>
            </div>
          </div>
          <i className="LoanPlatformSelector-dropdownIcon fas fa-chevron-down"></i>
        </div>

        {this.open && (
          <div className="LoanPlatformSelector-dropdownMenu" onclick={(e: MouseEvent) => e.stopPropagation()}>
            {platforms.length === 0 ? (
              <div className="LoanPlatformSelector-dropdownItem LoanPlatformSelector-noData">暂无可选平台</div>
            ) : (
              platforms.map((p) => (
                <div className="LoanPlatformSelector-dropdownItem" onclick={() => this.select(String(p.id()))}>
                  <div className="LoanPlatformSelector-icon">
                    <img className="PlatformIcon PlatformIcon--small" src={p.logoUrl()} alt={p.name()} />
                  </div>
                  <div className="LoanPlatformSelector-name">{p.name()}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  private toggle() {
    this.open = !this.open;
  }

  private handleDocClick = () => {
    if (this.open) {
      this.open = false;
      m.redraw();
    }
  };

  private select(val: string) {
    (this.attrs as PlatformSelectAttrs).onchange(val);
    this.open = false;
  }
}


