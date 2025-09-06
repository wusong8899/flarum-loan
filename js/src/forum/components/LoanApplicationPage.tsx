import Component from 'flarum/common/Component';
import app from 'flarum/forum/app';
import LoanApplicationForm from './LoanApplicationForm';
import ApprovedApplicationsList from './ApprovedApplicationsList';
import m, { Vnode } from 'mithril';
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

    console.log('[LoanApplicationPage] 发起并行API请求...');

    // 使用 Promise.allSettled 来处理各个请求，即使某个失败也不影响其他
    const results = await Promise.allSettled([
      app.store.find('loan-platforms') as any,
      app.store.find('loan-applications', { filter: { approved: '1' }, include: 'user,platform' } as any) as any,
      app.store.find('loan-virtual-approvals', { include: 'platform' }) as any
    ]);

    // 处理平台数据
    if (results[0].status === 'fulfilled') {
      const platforms = results[0].value;
      this.platforms = Array.isArray(platforms) ? platforms.filter(p => {
        const isValid = p != null;
        if (!isValid) console.warn('[LoanApplicationPage] 发现null平台:', p);
        return isValid;
      }) : [];
      console.log('[LoanApplicationPage] 平台加载成功，数量:', this.platforms.length);

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
    } else {
      console.error('[LoanApplicationPage] 加载平台失败:', results[0].reason);
      this.platforms = [];
    }

    // 处理已批准申请数据
    if (results[1].status === 'fulfilled') {
      const approvedApps = results[1].value;
      this.approvedApplications = Array.isArray(approvedApps) ? approvedApps.filter(app => {
        const isValid = app != null;
        if (!isValid) console.warn('[LoanApplicationPage] 发现null已批准申请:', app);
        return isValid;
      }) : [];
      console.log('[LoanApplicationPage] 已批准申请加载成功，数量:', this.approvedApplications.length);
    } else {
      console.error('[LoanApplicationPage] 加载已批准申请失败:', results[1].reason);
      this.approvedApplications = [];
    }

    // 处理虚拟审批数据
    if (results[2].status === 'fulfilled') {
      const virtualApprovals = results[2].value;
      this.virtualApprovals = Array.isArray(virtualApprovals) ? virtualApprovals.filter(v => {
        const isValid = v != null;
        if (!isValid) console.warn('[LoanApplicationPage] 发现null虚拟批准:', v);
        return isValid;
      }) : [];
      console.log('[LoanApplicationPage] 虚拟审批加载成功，数量:', this.virtualApprovals.length);
    } else {
      console.error('[LoanApplicationPage] 加载虚拟审批失败:', results[2].reason);
      this.virtualApprovals = [];
    }

    console.log('[LoanApplicationPage] 最终数据汇总:', {
      platformsCount: this.platforms.length,
      approvedAppsCount: this.approvedApplications.length,
      virtualApprovalsCount: this.virtualApprovals.length
    });

    console.log('[LoanApplicationPage] 数据加载完成，设置loading为false');
    this.loading = false;
    m.redraw();
  }
  oncreate() {
    document.body.classList.add('loan-standalone');
  }

  onremove() {
    document.body.classList.remove('loan-standalone');
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

  async submitApplication(payload: { platform_id: string; sponsor_account?: string; repayment_date?: string }): Promise<void> {
    await app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/loan-applications',
      body: { data: { attributes: payload } }
    });

    app.alerts.show({ type: 'success' }, '提交成功，等待审核');
  }
}
