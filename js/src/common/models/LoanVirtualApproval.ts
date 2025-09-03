import Model from 'flarum/common/Model';
import LoanPlatform from './LoanPlatform';

export default class LoanVirtualApproval extends Model {
  fakeUsername = Model.attribute<string>('fakeUsername');
  fakeAvatarUrl = Model.attribute<string>('fakeAvatarUrl');
  amount = Model.attribute<number>('amount');
  platform = Model.hasOne<LoanPlatform>('platform');
}
