import Model from 'flarum/common/Model';
import User from 'flarum/common/models/User';
import LoanPlatform from './LoanPlatform';

export default class LoanApplication extends Model {
  message = Model.attribute<string>('message');
  status = Model.attribute<string>('status');
  approvedAmount = Model.attribute<number>('approvedAmount');
  createdAt = Model.attribute<Date>('createdAt');
  reviewedAt = Model.attribute<Date>('reviewedAt');

  user = Model.hasOne<User>('user');
  platform = Model.hasOne<LoanPlatform>('platform');
}
