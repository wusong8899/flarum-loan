<?php

namespace Wusong8899\Loan\Api\Serializers;

use Flarum\Api\Serializer\AbstractSerializer;

class PlatformSerializer extends AbstractSerializer
{
    protected $type = 'loan-platforms';

    protected function getDefaultAttributes($platform)
    {
        return [
            'id' => $platform->id,
            'name' => $platform->name,
            'logoUrl' => $platform->logo_url,
            'sponsorLinkUrl' => $platform->sponsor_link_url,
            'currencyImageUrl' => $platform->currency_image_url,
            'sortOrder' => $platform->sort_order,
            'createdAt' => $this->formatDate($platform->created_at),
            'updatedAt' => $this->formatDate($platform->updated_at),
        ];
    }
}
