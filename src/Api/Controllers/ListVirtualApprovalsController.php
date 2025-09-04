<?php

namespace Wusong8899\Loan\Api\Controllers;

use Flarum\Api\Controller\AbstractListController;
use Wusong8899\Loan\Api\Serializers\VirtualApprovalSerializer;
use Wusong8899\Loan\Models\LoanVirtualApproval;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class ListVirtualApprovalsController extends AbstractListController
{
    public $serializer = VirtualApprovalSerializer::class;

    public $include = ['platform'];

    protected function data(ServerRequestInterface $request, Document $document)
    {
        return LoanVirtualApproval::with('platform')->orderByDesc('created_at')->get();
    }
}
