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
      <div className={`PlatformSelect${this.open ? ' is-open' : ''}`} oncreate={() => document.addEventListener('click', this.handleDocClick)} onremove={() => document.removeEventListener('click', this.handleDocClick)}>
        <button type="button" className="PlatformSelect-trigger" onclick={(e: MouseEvent) => { e.stopPropagation(); this.open = !this.open; }}>
          {selected ? (
            <span className="option">
              <img className="logo" src={selected.logoUrl()} alt={selected.name()} />
              <span className="name">{selected.name()}</span>
            </span>
          ) : (
            <span className="placeholder">请选择平台</span>
          )}
          <i className="icon fas fa-caret-down"></i>
        </button>
        {this.open && (
          <div className="PlatformSelect-menu">
            {platforms.map((p) => (
              <div className={`PlatformSelect-option${String(p.id()) === value ? ' is-active' : ''}`} onclick={() => this.select(String(p.id()))}>
                <img className="logo" src={p.logoUrl()} alt={p.name()} />
                <span className="name">{p.name()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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


