// js/src/admin/components/LoanSettingsPage.tsx
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import PlatformManager from './PlatformManager';
import ApplicationsManager from './ApplicationsManager';
import m,{Vnode} from 'mithril';

export default class LoanSettingsPage extends ExtensionPage {
  private activeTab: 'platforms' | 'applications' = 'platforms';

  oninit(vnode: Vnode) {
    super.oninit(vnode);

    this.activeTab = 'platforms';
  }

  content() {
    return (
      <div className="LoanSettingsPage">
        <div className="LoanSettingsPage-tabs">
          <button
            className={this.activeTab === 'platforms' ? 'active' : ''}
            onclick={() => { this.activeTab = 'platforms'; m.redraw(); }}
          >
            平台管理
          </button>
          <button
            className={this.activeTab === 'applications' ? 'active' : ''}
            onclick={() => { this.activeTab = 'applications'; m.redraw(); }}
          >
            申请管理
          </button>
        </div>

        <div className="LoanSettingsPage-content">
          {this.activeTab === 'platforms' && <PlatformManager />}
          {this.activeTab === 'applications' && <ApplicationsManager />}
        </div>
      </div>
    );
  }
}
