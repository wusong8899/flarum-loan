<?php

namespace Wusong8899\Loan\Api\Serializers;

use Flarum\Api\Serializer\AbstractSerializer;

class VirtualApprovalSerializer extends AbstractSerializer
{
    protected $type = 'loan-virtual-approvals';

    protected function getDefaultAttributes($approval)
    {
        return [
            'id' => $approval->id,
            'fakeUsername' => $approval->fake_username,
            'fakeAvatarUrl' => $approval->fake_avatar_url,
            'amount' => (int) $approval->amount,
            'createdAt' => $this->formatDate($approval->created_at),
        ];
    }

    protected function platform($approval)
    {
        return $this->hasOne($approval, PlatformSerializer::class);
    }
}
