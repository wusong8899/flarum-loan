import Model from 'flarum/common/Model';

export default class LoanPlatform extends Model {
  name = Model.attribute<string>('name');
  logoUrl = Model.attribute<string>('logoUrl');
  sortOrder = Model.attribute<number>('sortOrder');
}
