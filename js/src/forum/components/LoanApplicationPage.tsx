import Component from 'flarum/common/Component';
import app from 'flarum/forum/app';
import LoanApplicationForm from './LoanApplicationForm';
import ApprovedApplicationsList from './ApprovedApplicationsList';
import m,{Vnode} from 'mithril';
import LoanPlatform from '../../common/models/LoanPlatform';
import LoanApplication from '../../common/models/LoanApplication';
import LoanVirtualApproval from '../../common/models/LoanVirtualApproval';

export default class LoanApplicationPage extends Component {
  private loading: boolean = false;
  private platforms: LoanPlatform[] = [];
  private approvedApplications: LoanApplication[] = [];
  private virtualApprovals: LoanVirtualApproval[] = [];

  oninit(vnode: Vnode) {
    super.oninit(vnode);

    this.loading = true;
    this.platforms = [];
    this.approvedApplications = [];
    this.virtualApprovals = [];

    this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      const [platforms, approvedApps, virtualApprovals] = await Promise.all([
        app.store.find('loan-platforms') as any,
        app.store.find('loan-applications', { filter: { approved: '1' } } as any) as any,
        app.store.find('loan-virtual-approvals') as any
      ]);

      // 确保所有结果都是数组，过滤掉null/undefined值
      this.platforms = Array.isArray(platforms) ? platforms.filter(p => p != null) : [];
      this.approvedApplications = Array.isArray(approvedApps) ? approvedApps.filter(app => app != null) : [];
      this.virtualApprovals = Array.isArray(virtualApprovals) ? virtualApprovals.filter(v => v != null) : [];
    } catch (error) {
      console.error('Failed to load loan data:', error);
      // 设置默认的空数组
      this.platforms = [];
      this.approvedApplications = [];
      this.virtualApprovals = [];
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  view() {
    if (this.loading) return <div className="LoanPage">加载中...</div>;

    return (
      <div className="LoanPage">
        <h2>贷款申请</h2>
        <LoanApplicationForm
          platforms={this.platforms}
          onSubmit={this.submitApplication.bind(this)}
        />

        <ApprovedApplicationsList
          applications={this.approvedApplications}
          virtualApprovals={this.virtualApprovals}
        />
      </div>
    );
  }

  async submitApplication(payload: { platform_id: string; sponsor_account?: string; applicant_account?: string }): Promise<void> {
    await app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/loan-applications',
      body: { data: { attributes: payload } }
    });

    app.alerts.show({ type: 'success' }, '提交成功，等待审核');
  }
}
