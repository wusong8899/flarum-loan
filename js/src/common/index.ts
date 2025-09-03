import app from 'flarum/common/app';
import LoanPlatform from './models/LoanPlatform';
import LoanApplication from './models/LoanApplication';
import LoanVirtualApproval from './models/LoanVirtualApproval';

app.initializers.add('wusong8899-loan', () => {
  app.store.models['loan-platforms'] = LoanPlatform;
  app.store.models['loan-applications'] = LoanApplication;
  app.store.models['loan-virtual-approvals'] = LoanVirtualApproval;
});
