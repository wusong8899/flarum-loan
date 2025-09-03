import app from 'flarum/forum/app';
import LoanApplicationPage from './components/LoanApplicationPage';
import LoanPlatform from '../common/models/LoanPlatform';
import LoanApplication from '../common/models/LoanApplication';
import LoanVirtualApproval from '../common/models/LoanVirtualApproval';

app.initializers.add('wusong8899-loan', () => {
  app.routes['wusong8899.loan'] = { path: '/loan', component: LoanApplicationPage } as any;
  app.store.models['loan-platforms'] = LoanPlatform;
  app.store.models['loan-applications'] = LoanApplication;
  app.store.models['loan-virtual-approvals'] = LoanVirtualApproval;
});
