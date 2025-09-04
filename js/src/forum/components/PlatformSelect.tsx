import Component from 'flarum/common/Component';
import m, { VnodeDOM } from 'mithril';
import LoanPlatform from '../../common/models/LoanPlatform';

type PlatformSelectAttrs = {
  platforms: LoanPlatform[];
  value: string;
  onchange: (val: string) => void;
};

export default class PlatformSelect extends Component<PlatformSelectAttrs> {
  private open = false;

  oncreate(vnode: VnodeDOM) {
    super.oncreate(vnode);
    document.addEventListener('click', this.handleDocClick);
  }

  onremove(vnode: VnodeDOM) {
    super.onremove(vnode);
    document.removeEventListener('click', this.handleDocClick);
  }

  view() {
    const { platforms = [], value } = this.attrs as PlatformSelectAttrs;
    const list = Array.isArray(platforms)
      ? platforms.filter((p) => p && typeof (p as any).id === 'function' && (p as any).id() != null)
      : [];
    const selected = list.find((p) => String(p.id()) === value) || null;

    return (
      <div className="LoanPlatformSelector">
        <div className="LoanPlatformSelector-dropdown" onclick={(e: MouseEvent) => { e.stopPropagation(); this.toggle(); }}>
          <div className="LoanPlatformSelector-selected">
            <div className="LoanPlatformSelector-info">
              <div className="LoanPlatformSelector-icon">
                {selected ? (
                  <img className="PlatformIcon PlatformIcon--medium" src={selected.logoUrl()} alt={selected.name()} />
                ) : (
                  <span className="PlatformIcon PlatformIcon--medium PlatformIcon--placeholder"></span>
                )}
              </div>
              <div className="LoanPlatformSelector-details">
                <div className="LoanPlatformSelector-name">{selected ? selected.name() : '请选择平台'}</div>
              </div>
            </div>
            <i className={`LoanPlatformSelector-dropdownIcon fas fa-chevron-${this.open ? 'up' : 'down'}`}></i>
          </div>
        </div>

        {this.open && (
          <div className="LoanPlatformSelector-dropdownMenu" onclick={(e: MouseEvent) => e.stopPropagation()}>
            {list.length === 0 ? (
              <div className="LoanPlatformSelector-dropdownItem LoanPlatformSelector-noData">暂无可选平台</div>
            ) : (
              list.map((p, index) => (
                <div
                  key={String((p as any).id() ?? index)}
                  className="LoanPlatformSelector-dropdownItem"
                  onclick={() => this.select(String((p as any).id()))}
                >
                  <div className="LoanPlatformSelector-icon">
                    <img className="PlatformIcon PlatformIcon--small" src={(p as any).logoUrl()} alt={(p as any).name()} />
                  </div>
                  <div className="LoanPlatformSelector-name">{(p as any).name()}</div>
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
    m.redraw();
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
    m.redraw();
  }
}


