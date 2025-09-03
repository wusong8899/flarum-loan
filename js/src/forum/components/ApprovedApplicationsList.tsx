// js/src/forum/components/ApprovedApplicationsList.tsx
import Component from 'flarum/common/Component';
import avatar from 'flarum/common/helpers/avatar';
import username from 'flarum/common/helpers/username';
import LoanApplication from '../../common/models/LoanApplication';
import LoanVirtualApproval from '../../common/models/LoanVirtualApproval';

type ApprovedApplicationsListAttrs = {
  applications: LoanApplication[];
  virtualApprovals: LoanVirtualApproval[];
};

export default class ApprovedApplicationsList extends Component<ApprovedApplicationsListAttrs> {
  view() {
    const { applications = [], virtualApprovals = [] } = this.attrs as ApprovedApplicationsListAttrs;

    // 合并真实和虚拟数据
    const allApprovals = [
      ...applications.map((app: LoanApplication) => ({
        type: 'real',
        id: app.id(),
        username: username((app.user() || null) as any),
        avatar: avatar((app.user() || null) as any),
        platform: app.platform() as any,
        amount: app.approvedAmount()
      })),
      ...virtualApprovals.map((va: LoanVirtualApproval) => ({
        type: 'virtual',
        id: va.id(),
        username: va.fakeUsername(),
        avatar: <img src={va.fakeAvatarUrl()} className="Avatar" />,
        platform: va.platform(),
        amount: va.amount()
      }))
    ];

    // 随机排序
    allApprovals.sort(() => Math.random() - 0.5);

    return (
      <div className="ApprovedApplicationsList">
        <h3>申请通过列表</h3>
        <div className="ApprovalCards">
          {allApprovals.map(approval => (
            <div className="ApprovalCard" key={approval.id}>
              <div className="ApprovalCard-user">
                {approval.avatar}
                <span className="username">{approval.username}</span>
              </div>

              <div className="ApprovalCard-platform">
                <img
                  src={(approval.platform as any).logoUrl?.()}
                  alt={(approval.platform as any).name?.()}
                  className="platform-logo"
                />
                <span className="platform-name">{(approval.platform as any).name?.()}</span>
              </div>

              <div className="ApprovalCard-amount">
                <span className="amount-label">获批额度</span>
                <span className="amount-value">¥{approval.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
