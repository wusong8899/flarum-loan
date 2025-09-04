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
    console.log('[LoanApplicationPage] 页面组件初始化开始', vnode);
    super.oninit(vnode);

    this.loading = true;
    this.platforms = [];
    this.approvedApplications = [];
    this.virtualApprovals = [];

    console.log('[LoanApplicationPage] 属性设置完成，开始加载数据');
    this.loadData();
  }

    async loadData(): Promise<void> {
    console.log('[LoanApplicationPage] 开始加载页面数据...');
    try {
      console.log('[LoanApplicationPage] 发起并行API请求...');
      const [platforms, approvedApps, virtualApprovals] = await Promise.all([
        app.store.find('loan-platforms') as any,
        app.store.find('loan-applications', { filter: { approved: '1' } } as any) as any,
        app.store.find('loan-virtual-approvals') as any
      ]);
      
      console.log('[LoanApplicationPage] API返回结果:', {
        platforms: {
          type: typeof platforms,
          isArray: Array.isArray(platforms),
          length: Array.isArray(platforms) ? platforms.length : 'N/A',
          data: platforms
        },
        approvedApps: {
          type: typeof approvedApps,
          isArray: Array.isArray(approvedApps),
          length: Array.isArray(approvedApps) ? approvedApps.length : 'N/A',
          data: approvedApps
        },
        virtualApprovals: {
          type: typeof virtualApprovals,
          isArray: Array.isArray(virtualApprovals),
          length: Array.isArray(virtualApprovals) ? virtualApprovals.length : 'N/A',
          data: virtualApprovals
        }
      });
      
      // 确保所有结果都是数组，过滤掉null/undefined值
      this.platforms = Array.isArray(platforms) ? platforms.filter(p => {
        const isValid = p != null;
        if (!isValid) console.warn('[LoanApplicationPage] 发现null平台:', p);
        return isValid;
      }) : [];
      
      this.approvedApplications = Array.isArray(approvedApps) ? approvedApps.filter(app => {
        const isValid = app != null;
        if (!isValid) console.warn('[LoanApplicationPage] 发现null已批准申请:', app);
        return isValid;
      }) : [];
      
      this.virtualApprovals = Array.isArray(virtualApprovals) ? virtualApprovals.filter(v => {
        const isValid = v != null;
        if (!isValid) console.warn('[LoanApplicationPage] 发现null虚拟批准:', v);
        return isValid;
      }) : [];

      console.log('[LoanApplicationPage] 过滤后的数据:', {
        platformsCount: this.platforms.length,
        approvedAppsCount: this.approvedApplications.length,
        virtualApprovalsCount: this.virtualApprovals.length
      });

      // 详细检查每个平台
      this.platforms.forEach((platform, index) => {
        console.log(`[LoanApplicationPage] 平台 ${index}:`, {
          id: platform.id?.(),
          name: platform.name?.(),
          logoUrl: platform.logoUrl?.(),
          sponsorLinkUrl: platform.sponsorLinkUrl?.(),
          currencyImageUrl: platform.currencyImageUrl?.()
        });
      });

    } catch (error) {
      console.error('[LoanApplicationPage] 加载页面数据失败:', error);
      // 设置默认的空数组
      this.platforms = [];
      this.approvedApplications = [];
      this.virtualApprovals = [];
    } finally {
      console.log('[LoanApplicationPage] 数据加载完成，设置loading为false');
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
