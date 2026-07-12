<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Driver\StoreDriverRequest;
use App\Http\Requests\Driver\UpdateDriverRequest;
use App\Http\Resources\DriverResource;
use App\Models\Driver;
use App\Services\DriverService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DriverController extends Controller
{
    public function __construct(private readonly DriverService $driverService)
    {
    }

    /**
     * Display a paginated listing of drivers.
     */
    public function index(): AnonymousResourceCollection
    {
        $drivers = Driver::query()->latest()->paginate(15);

        return DriverResource::collection($drivers);
    }

    /**
     * Display the specified driver.
     */
    public function show(Driver $driver): DriverResource
    {
        return new DriverResource($driver);
    }

    /**
     * Store a newly created driver.
     */
    public function store(StoreDriverRequest $request): DriverResource
    {
        $driver = $this->driverService->create($request->validated());

        return new DriverResource($driver);
    }

    /**
     * Update the specified driver.
     */
    public function update(UpdateDriverRequest $request, Driver $driver): DriverResource
    {
        $driver = $this->driverService->update($driver, $request->validated());

        return new DriverResource($driver);
    }

    /**
     * Remove the specified driver.
     */
    public function destroy(Driver $driver): JsonResponse
    {
        $this->driverService->delete($driver);

        return response()->json(null, 204);
    }

    /**
     * Suspend the specified driver.
     */
    public function suspend(Driver $driver): DriverResource
    {
        $driver = $this->driverService->suspend($driver);

        return new DriverResource($driver);
    }

    /**
     * Activate the specified driver.
     */
    public function activate(Driver $driver): DriverResource
    {
        $driver = $this->driverService->activate($driver);

        return new DriverResource($driver);
    }
}
