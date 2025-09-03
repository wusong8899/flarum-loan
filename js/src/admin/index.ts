import app from 'flarum/admin/app';
import LoanSettingsPage from './components/LoanSettingsPage';
import '../common/index';

app.initializers.add('wusong8899-loan', () => {
  app.extensionData.for('wusong8899-loan').registerPage(LoanSettingsPage);
});
