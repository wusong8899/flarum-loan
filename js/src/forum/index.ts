import app from 'flarum/forum/app';
import LoanApplicationPage from './components/LoanApplicationPage';
import '../common/index';

app.initializers.add('wusong8899-loan', () => {
  app.routes['wusong8899.loan'] = { path: '/loan', component: LoanApplicationPage } as any;
});
