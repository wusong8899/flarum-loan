import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import app from 'flarum/admin/app';
import m,{Vnode} from 'mithril';
import LoanApplication from '../../common/models/LoanApplication';

export default class ApplicationsManager extends Component {
  private loading: boolean = false;
  private applications: LoanApplication[] = [];

  oninit(vnode: Vnode) {
    super.oninit(vnode);
    this.loading = true;
    this.applications = [];
    this.load();
  }

  async load(): Promise<void> {
    try {
      this.applications = await app.store.find('loan-applications', { include: 'user,platform' }) as any;
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  view() {
    return (
      <div className="ApplicationsManager">
        <div className="ApplicationsManager-header">
          <h3>贷款申请管理</h3>
          <Button className="Button" onclick={() => this.load()}>刷新</Button>
        </div>

        {this.loading ? (
          <div>加载中...</div>
        ) : (
          <table className="ApplicationTable">
            <thead>
              <tr>
                <th>用户</th>
                <th>平台</th>
                <th>赞助账号</th>
                <th>申请账号</th>
                <th>状态</th>
                <th>批准额度</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {this.applications.map((appModel: LoanApplication) => (
                <tr key={appModel.id()}>
                  <td>{(appModel.user() && (appModel.user() as any).displayName) ? (appModel.user() as any).displayName() : '-'}</td>
                  <td>{(appModel.platform() && (appModel.platform() as any).name) ? (appModel.platform() as any).name() : '-'}</td>
                  <td>{appModel.sponsorAccount?.() || '-'}</td>
                  <td>{appModel.applicantAccount?.() || '-'}</td>
                  <td>{appModel.status()}</td>
                  <td>{appModel.approvedAmount() || '-'}</td>
                  <td>
                    <Button className="Button Button--link" onclick={() => this.review(appModel, 'approved')}>通过</Button>
                    <Button className="Button Button--link" onclick={() => this.review(appModel, 'rejected')}>拒绝</Button>
                    <Button className="Button Button--link" onclick={() => this.openSponsorLink(appModel)}>赞助链接</Button>
                    <Button className="Button Button--link" onclick={() => this.remove(appModel)}>删除</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  async review(appModel: LoanApplication, status: 'approved' | 'rejected'): Promise<void> {
    const attrs: any = { status };

    if (status === 'approved') {
      const defaultValue = appModel.approvedAmount?.() ? String(appModel.approvedAmount()) : '';
      const input = prompt('请输入批准额度（整数）', defaultValue);
      if (input === null) return; // cancelled
      const amount = parseInt(input, 10);
      if (isNaN(amount) || amount < 0) {
        alert('请输入有效的非负整数');
        return;
      }
      attrs.approved_amount = amount;
    } else {
      attrs.approved_amount = null;
    }

    await app.request({
      method: 'PATCH',
      url: `${app.forum.attribute('apiUrl')}/loan-applications/${appModel.id()}`,
      body: { data: { attributes: attrs } }
    });
    await this.load();
  }

  async remove(appModel: LoanApplication): Promise<void> {
    if (!confirm('确定删除该申请吗？')) return;
    await appModel.delete();
    await this.load();
  }

  openSponsorLink(appModel: LoanApplication) {
    const platform = appModel.platform() as any;
    const url = platform && platform.sponsorLinkUrl ? platform.sponsorLinkUrl() : null;
    if (url) {
      window.open(url, '_blank');
    } else {
      app.alerts.show({ type: 'warning' }, '该平台未配置赞助平台链接');
    }
  }
}




