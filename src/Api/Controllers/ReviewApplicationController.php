<?php

namespace Wusong8899\Loan\Api\Controllers;

use Carbon\Carbon;
use Flarum\Api\Controller\AbstractShowController;
use Wusong8899\Loan\Api\Serializers\ApplicationSerializer;
use Wusong8899\Loan\Models\LoanApplication;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class ReviewApplicationController extends AbstractShowController
{
    public $serializer = ApplicationSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = $request->getAttribute('actor');
        $actor->assertAdmin();

        $id = Arr::get($request->getQueryParams(), 'id');
        $data = Arr::get($request->getParsedBody(), 'data.attributes');

        $application = LoanApplication::findOrFail($id);

        $application->status = Arr::get($data, 'status');
        $application->reviewed_by = $actor->id;
        $application->reviewed_at = Carbon::now();

        if ($application->status === 'approved') {
            $amount = Arr::get($data, 'approved_amount');
            if ($amount !== null) {
                $application->approved_amount = (int) $amount;
            }
        } else if ($application->status === 'rejected') {
            $application->approved_amount = null;
        }

        $application->save();

        return $application;
    }
}
