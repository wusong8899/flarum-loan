// js/src/admin/components/LoanSettingsPage.tsx
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import app from 'flarum/admin/app';
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
          <div className="LoanSettingsPage-danger">
            <h4>危险操作</h4>
            <button className="Button Button--danger" onclick={this.clearAll.bind(this)}>一键清空申请/审批</button>
          </div>
        </div>
      </div>
    );
  }

  async clearAll() {
    if (!confirm('确定要清空所有申请与虚拟审批数据吗？此操作不可撤销。')) return;
    try {
      await app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/loan-clear',
      });
      app.alerts.show({ type: 'success' }, '已清空申请与虚拟审批数据');
    } catch (e) {
      app.alerts.show({ type: 'error' }, '清空失败');
    }
  }
}
