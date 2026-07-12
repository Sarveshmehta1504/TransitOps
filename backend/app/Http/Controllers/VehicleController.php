<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Vehicle\StoreVehicleRequest;
use App\Http\Requests\Vehicle\UpdateVehicleRequest;
use App\Http\Resources\VehicleResource;
use App\Models\Vehicle;
use App\Services\VehicleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VehicleController extends Controller
{
    public function __construct(private readonly VehicleService $vehicleService)
    {
    }

    /**
     * Display a paginated listing of vehicles.
     */
    public function index(): AnonymousResourceCollection
    {
        $vehicles = Vehicle::query()->latest()->paginate(15);

        return VehicleResource::collection($vehicles);
    }

    /**
     * Display the specified vehicle.
     */
    public function show(Vehicle $vehicle): VehicleResource
    {
        return new VehicleResource($vehicle);
    }

    /**
     * Store a newly created vehicle.
     */
    public function store(StoreVehicleRequest $request): VehicleResource
    {
        $vehicle = $this->vehicleService->create($request->validated());

        return new VehicleResource($vehicle);
    }

    /**
     * Update the specified vehicle.
     */
    public function update(UpdateVehicleRequest $request, Vehicle $vehicle): VehicleResource
    {
        $vehicle = $this->vehicleService->update($vehicle, $request->validated());

        return new VehicleResource($vehicle);
    }

    /**
     * Remove the specified vehicle.
     */
    public function destroy(Vehicle $vehicle): JsonResponse
    {
        $this->vehicleService->delete($vehicle);

        return response()->json(null, 204);
    }

    /**
     * Retire the specified vehicle.
     */
    public function retire(Vehicle $vehicle): VehicleResource
    {
        $vehicle = $this->vehicleService->retire($vehicle);

        return new VehicleResource($vehicle);
    }
}
