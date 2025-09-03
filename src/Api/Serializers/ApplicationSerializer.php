<?php

namespace Wusong8899\Loan\Api\Serializers;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Api\Serializer\BasicUserSerializer;
use Wusong8899\Loan\Api\Serializers\PlatformSerializer;
use Tobscure\JsonApi\Relationship;

class ApplicationSerializer extends AbstractSerializer
{
    protected $type = 'loan-applications';

    protected function getDefaultAttributes($application)
    {
        return [
            'id' => $application->id,
            'sponsorAccount' => $application->sponsor_account,
            'applicantAccount' => $application->applicant_account,
            'status' => $application->status,
            'approvedAmount' => $application->approved_amount,
            'createdAt' => $this->formatDate($application->created_at),
            'reviewedAt' => $this->formatDate($application->reviewed_at),
        ];
    }

    protected function user($application): Relationship
    {
        return $this->hasOne($application, BasicUserSerializer::class);
    }

    protected function platform($application): Relationship
    {
        return $this->hasOne($application, PlatformSerializer::class);
    }
}
