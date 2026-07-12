<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Trip\CompleteTripRequest;
use App\Http\Requests\Trip\DispatchTripRequest;
use App\Http\Requests\Trip\StoreTripRequest;
use App\Http\Requests\Trip\UpdateTripRequest;
use App\Http\Resources\TripResource;
use App\Models\Trip;
use App\Services\TripService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TripController extends Controller
{
    public function __construct(private readonly TripService $tripService)
    {
    }

    /**
     * Display a paginated listing of trips.
     */
    public function index(): AnonymousResourceCollection
    {
        $trips = Trip::query()
            ->with(['vehicle', 'driver', 'fuelLogs', 'expenses'])
            ->latest()
            ->paginate(15);

        return TripResource::collection($trips);
    }

    /**
     * Display the specified trip.
     */
    public function show(Trip $trip): TripResource
    {
        $trip->load(['vehicle', 'driver', 'fuelLogs', 'expenses']);

        return new TripResource($trip);
    }

    /**
     * Store a newly created trip.
     */
    public function store(StoreTripRequest $request): TripResource
    {
        $trip = $this->tripService->createTrip($request->validated());

        return new TripResource($trip);
    }

    /**
     * Update the specified trip.
     */
    public function update(UpdateTripRequest $request, Trip $trip): TripResource
    {
        $trip = $this->tripService->updateTrip($trip, $request->validated());

        return new TripResource($trip);
    }

    /**
     * Remove the specified trip.
     */
    public function destroy(Trip $trip): JsonResponse
    {
        call_user_func([$this->tripService, 'deleteTrip'], $trip);

        return response()->json(null, 204);
    }

    /**
     * Dispatch the specified trip.
     */
    public function dispatch(Trip $trip, DispatchTripRequest $request): TripResource
    {
        $trip = $this->tripService->dispatchTrip($trip);

        return new TripResource($trip);
    }

    /**
     * Complete the specified trip.
     */
    public function complete(Trip $trip, CompleteTripRequest $request): TripResource
    {
        $trip = $this->tripService->completeTrip($trip, $request->validated());

        return new TripResource($trip);
    }

    /**
     * Cancel the specified trip.
     */
    public function cancel(Trip $trip): TripResource
    {
        $trip = $this->tripService->cancelTrip($trip);

        return new TripResource($trip);
    }
}
