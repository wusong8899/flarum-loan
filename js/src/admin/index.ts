import app from 'flarum/admin/app';
import LoanSettingsPage from './components/LoanSettingsPage';
import LoanPlatform from '../common/models/LoanPlatform';
import LoanApplication from '../common/models/LoanApplication';
import LoanVirtualApproval from '../common/models/LoanVirtualApproval';

app.initializers.add('wusong8899-loan', () => {
  app.extensionData.for('wusong8899-loan').registerPage(LoanSettingsPage);
  app.store.models['loan-platforms'] = LoanPlatform;
  app.store.models['loan-applications'] = LoanApplication;
  app.store.models['loan-virtual-approvals'] = LoanVirtualApproval;
});
