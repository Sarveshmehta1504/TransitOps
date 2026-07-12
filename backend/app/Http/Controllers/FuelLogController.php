<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\FuelLog\StoreFuelLogRequest;
use App\Http\Requests\FuelLog\UpdateFuelLogRequest;
use App\Http\Resources\FuelLogResource;
use App\Models\FuelLog;
use App\Services\FuelLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FuelLogController extends Controller
{
    public function __construct(private readonly FuelLogService $fuelLogService)
    {
    }

    /**
     * Display a paginated listing of fuel logs.
     */
    public function index(): AnonymousResourceCollection
    {
        $fuelLogs = FuelLog::query()
            ->with(['vehicle', 'trip'])
            ->latest()
            ->paginate(15);

        return FuelLogResource::collection($fuelLogs);
    }

    /**
     * Display the specified fuel log.
     */
    public function show(FuelLog $fuelLog): FuelLogResource
    {
        $fuelLog->load(['vehicle', 'trip']);

        return new FuelLogResource($fuelLog);
    }

    /**
     * Store a newly created fuel log.
     */
    public function store(StoreFuelLogRequest $request): FuelLogResource
    {
        $fuelLog = $this->fuelLogService->create($request->validated());
        $fuelLog->load(['vehicle', 'trip']);

        return new FuelLogResource($fuelLog);
    }

    /**
     * Update the specified fuel log.
     */
    public function update(UpdateFuelLogRequest $request, FuelLog $fuelLog): FuelLogResource
    {
        $fuelLog = $this->fuelLogService->update($fuelLog, $request->validated());
        $fuelLog->load(['vehicle', 'trip']);

        return new FuelLogResource($fuelLog);
    }

    /**
     * Remove the specified fuel log.
     */
    public function destroy(FuelLog $fuelLog): JsonResponse
    {
        $this->fuelLogService->delete($fuelLog);

        return response()->json(null, 204);
    }
}
