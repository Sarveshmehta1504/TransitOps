<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Maintenance\StoreMaintenanceRequest;
use App\Http\Requests\Maintenance\UpdateMaintenanceRequest;
use App\Http\Resources\MaintenanceResource;
use App\Models\MaintenanceLog;
use App\Services\MaintenanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MaintenanceController extends Controller
{
    public function __construct(private readonly MaintenanceService $maintenanceService)
    {
    }

    /**
     * Display a paginated listing of maintenance records.
     */
    public function index(): AnonymousResourceCollection
    {
        $maintenanceRecords = MaintenanceLog::query()
            ->with('vehicle')
            ->latest()
            ->paginate(15);

        return MaintenanceResource::collection($maintenanceRecords);
    }

    /**
     * Display the specified maintenance record.
     */
    public function show(MaintenanceLog $maintenance): MaintenanceResource
    {
        $maintenance->load('vehicle');

        return new MaintenanceResource($maintenance);
    }

    /**
     * Store a newly created maintenance record.
     */
    public function store(StoreMaintenanceRequest $request): MaintenanceResource
    {
        $maintenance = $this->maintenanceService->create($request->validated());
        $maintenance->load('vehicle');

        return new MaintenanceResource($maintenance);
    }

    /**
     * Update the specified maintenance record.
     */
    public function update(UpdateMaintenanceRequest $request, MaintenanceLog $maintenance): MaintenanceResource
    {
        $maintenance = $this->maintenanceService->update($maintenance, $request->validated());
        $maintenance->load('vehicle');

        return new MaintenanceResource($maintenance);
    }

    /**
     * Remove the specified maintenance record.
     */
    public function destroy(MaintenanceLog $maintenance): JsonResponse
    {
        $this->maintenanceService->delete($maintenance);

        return response()->json(null, 204);
    }

    /**
     * Start the specified maintenance workflow.
     */
    public function start(MaintenanceLog $maintenance): MaintenanceResource
    {
        $maintenance = $this->maintenanceService->start($maintenance);
        $maintenance->load('vehicle');

        return new MaintenanceResource($maintenance);
    }

    /**
     * Complete the specified maintenance workflow.
     */
    public function complete(MaintenanceLog $maintenance): MaintenanceResource
    {
        $maintenance = $this->maintenanceService->complete($maintenance);
        $maintenance->load('vehicle');

        return new MaintenanceResource($maintenance);
    }

    /**
     * Cancel the specified maintenance workflow.
     */
    public function cancel(MaintenanceLog $maintenance): MaintenanceResource
    {
        $maintenance = $this->maintenanceService->cancel($maintenance);
        $maintenance->load('vehicle');

        return new MaintenanceResource($maintenance);
    }
}